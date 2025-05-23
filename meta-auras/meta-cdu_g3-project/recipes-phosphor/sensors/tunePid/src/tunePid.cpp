#include <iostream>
#include <filesystem>
#include <sstream>
#include <chrono>
#include <fstream>
#include <iomanip>
#include <ctime>
// #include <conio.h>
#include <boost/chrono.hpp>
#include <boost/thread/thread.hpp>
#include "tunePid.hpp"
#include <nlohmann/json.hpp>
#include <gpiod.hpp>
#include <termios.h>

static double Kp, Ki, Kd, setPoint;
static unsigned int sampleTime, intervalTime;    //ms
static bool needToResetStm32;
static bool terminateThread = false;
static int halHandler;
static std::atomic_flag halSpinlock = ATOMIC_FLAG_INIT;
static bool showDetail = true;

static bool isResettingStm32 = false;
static bool isManualMode = false;
static bool isComputeRunning = false;

/* working variables */
static unsigned long lastPV = 0;
static double Output_valve, Process_value, error, Iterm, dInput;

// void daemonUsage(void)
// {
//     std::cout << "Usage: stm32io [-[d][h][v][s]]" << std::endl;
//     std::cout << "   d: Enable debug log." << std::endl;
//     std::cout << "   h: Show this help message." << std::endl;
//     std::cout << "   v: Enable debug log & show the updated content of the data." << std::endl;
//     std::cout << "   s: Save log to " << TUNE_PID_LOG_PATH << "." << std::endl;
// }

// To avoid dbg log file too large.
void truncateHalf(const std::string& filename) {
    std::ifstream ifs(filename, std::ios::binary | std::ios::ate);
    if (!ifs.is_open()) {
        std::cerr << "Could not open file for reading." << std::endl;
        return;
    }

    std::streamsize fileSize = ifs.tellg();
    ifs.seekg(0, std::ios::beg);

    std::vector<char> buffer(fileSize);
    ifs.read(buffer.data(), fileSize);
    ifs.close();

    std::streamsize halfSize = fileSize / 2;

    // Find the closest newline character after the half-way mark.
    for (; halfSize < fileSize; ++halfSize) {
        if (buffer[halfSize] == '\n') {
            ++halfSize;  // Move past the newline character.
            break;
        }
    }

    // If a newline character was not found, then we can't really proceed.
    if (halfSize >= fileSize) {
        std::cerr << "Could not find a newline character after the half-way mark." << std::endl;
        return;
    }

    std::ofstream ofs(filename, std::ios::binary | std::ios::trunc);
    if (!ofs.is_open()) {
        std::cerr << "Could not open file for writing." << std::endl;
        return;
    }

    ofs.write(buffer.data() + halfSize, fileSize - halfSize);
    ofs.close();
}

void checkLogSize(const std::string& filename, std::size_t maxSize) {
    std::ifstream file(filename, std::ifstream::ate | std::ifstream::binary);
    if (!file.is_open()) {
        return;
    }

    std::size_t size = file.tellg();
    // If too large, truncate to half.
    if (size > maxSize) {
        truncateHalf(filename);
    }
}

void appendToStream(std::ostringstream& oss) {
}

template<typename T, typename... Args>
void appendToStream(std::ostringstream& oss, T t, Args... args) {
    oss << t;
    appendToStream(oss, args...);
}

template<typename... Args>
void saveLogToFile(Args... args) {
    checkLogSize(TUNE_PID_LOG_PATH, TUNE_PID_LOG_MAX_SIZE);

    std::ofstream logFile(TUNE_PID_LOG_PATH, std::ios::app);
    auto now = std::chrono::system_clock::now();
    auto itt = std::chrono::system_clock::to_time_t(now);

    std::chrono::duration<double> fractional_seconds = now - std::chrono::time_point_cast<std::chrono::seconds>(now);

    std::ostringstream oss_time;
    oss_time << std::put_time(std::localtime(&itt), "%Y-%m-%d %H:%M:%S")
                << '.' << std::setw(3) << std::setfill('0')
                << static_cast<int>(fractional_seconds.count() * 1000);

    std::ostringstream oss;
    appendToStream(oss, args...);

    if (logFile.is_open()) {
        logFile << "[" << oss_time.str() << "] " << oss.str() << std::endl;
        logFile.close();
    } else {
        std::cerr << "Error opening or creating file: " << TUNE_PID_LOG_PATH << std::endl;
    }
}

bool halLock(std::chrono::milliseconds timeout)
{
    boost::this_thread::sleep_for(boost::chrono::milliseconds(intervalTime));
    auto start = std::chrono::steady_clock::now();
    while (halSpinlock.test_and_set(std::memory_order_acquire)) {
        if (std::chrono::steady_clock::now() - start >= timeout) {
            return false;
        }
    }
    return true;
}

void halUnlock()
{
    halSpinlock.clear(std::memory_order_release);
}

void printCurrentVariable(void) {
    std::cout << std::endl << "========================================" << std::endl;
    std::cout << "Current setting and reading:" << std::endl;
    std::cout << "Set Point: " << setPoint << " LPM" << std::endl;
    std::cout << "Kp: " << Kp << std::endl;
    std::cout << "Ki: " << Ki << std::endl;
    std::cout << "Kd: " << Kd << std::endl;
    std::cout << "Sample Time: " << sampleTime << " ms" << std::endl;
    std::cout << "HAL Interval Time: " << intervalTime << " ms" << std::endl;
    std::cout << "Need to reset STM32 when exec tunePid: " << needToResetStm32 << std::endl;
    std::cout << "========================================" << std::endl << std::endl;
}

void initVariable(void) {

    if (!std::filesystem::exists(TUNE_PID_JSON_DIR)) {
        std::cout << "Directory " << TUNE_PID_JSON_DIR << " does not exist. Creating directory..." << std::endl;

        if (!std::filesystem::create_directories(TUNE_PID_JSON_DIR)) {
            std::cout << "Failed to create directory." << TUNE_PID_JSON_DIR << std::endl;
        }
    }

    std::ifstream jsonFile(TUNE_PID_JSON_PATH);
    nlohmann::json jsonData;

    // Check file exist or not
    if (jsonFile.is_open()) {
        // If file exist read json file
        jsonFile >> jsonData;
        jsonFile.close();

        if (jsonData.contains("Kp")) {
            try {
                Kp = jsonData["Kp"].get<double>();
            } catch (const nlohmann::json::type_error& e) {
                std::cout << "Kp is not a double. Error: " << e.what() << std::endl;
                Kp = DFT_KP;
            }
        } else {
            std::cout << "Kp is missing in JSON" << std::endl;
            Kp = DFT_KP;
        }

        if (jsonData.contains("Ki")) {
            try {
                Ki = jsonData["Ki"].get<double>();
            } catch (const nlohmann::json::type_error& e) {
                std::cout << "Ki is not a double. Error: " << e.what() << std::endl;
                Ki = DFT_KI;
            }
        } else {
            std::cout << "Ki is missing in JSON" << std::endl;
            Ki = DFT_KI;
        }

        if (jsonData.contains("Kd")) {
            try {
                Kd = jsonData["Kd"].get<double>();
            } catch (const nlohmann::json::type_error& e) {
                std::cout << "Kd is not a double. Error: " << e.what() << std::endl;
                Kd = DFT_KD;
            }
        } else {
            std::cout << "Kd is missing in JSON" << std::endl;
            Kd = DFT_KD;
        }

        if (jsonData.contains("setPoint")) {
            try {
                setPoint = jsonData["setPoint"].get<double>();
                if (setPoint < 0 || setPoint > 550) {
                    std::cout << "setPoint is out of range. Set to default value" << std::endl;
                    setPoint = DFT_SETPOINT;
                }
            } catch (const nlohmann::json::type_error& e) {
                std::cout << "setPoint is not a double. Error: " << e.what() << std::endl;
                setPoint = DFT_SETPOINT;
            }
        } else {
            std::cout << "setPoint is missing in JSON" << std::endl;
            setPoint = DFT_SETPOINT;
        }

        if (jsonData.contains("sampleTime")) {
            try {
                sampleTime = jsonData["sampleTime"].get<int>();
                if (sampleTime < 0) {
                    std::cout << "sampleTime is out of range. Set to default value" << std::endl;
                    sampleTime = DFT_SAMPLE_TIME;
                }
            } catch (const nlohmann::json::type_error& e) {
                std::cout << "sampleTime is not a int. Error: " << e.what() << std::endl;
                sampleTime = DFT_SAMPLE_TIME;
            }
        } else {
            std::cout << "sampleTime is missing in JSON" << std::endl;
            sampleTime = DFT_SAMPLE_TIME;
        }

        if (jsonData.contains("intervalTime")) {
            try {
                intervalTime = jsonData["intervalTime"].get<int>();
                if (intervalTime < 0) {
                    std::cout << "intervalTime is out of range. Set to default value" << std::endl;
                    intervalTime = DFT_INTERVAL_TIME;
                }
            } catch (const nlohmann::json::type_error& e) {
                std::cout << "intervalTime is not a int. Error: " << e.what() << std::endl;
                intervalTime = DFT_INTERVAL_TIME;
            }
        } else {
            std::cout << "intervalTime is missing in JSON" << std::endl;
            intervalTime = DFT_INTERVAL_TIME;
        }

        if (jsonData.contains("needToResetStm32")) {
            try {
                needToResetStm32 = jsonData["needToResetStm32"].get<bool>();
            } catch (const nlohmann::json::type_error& e) {
                std::cout << "needToResetStm32 is not a bool. Error: " << e.what() << std::endl;
                needToResetStm32 = DFT_NEED_RESET_STM32;
            }
        } else {
            std::cout << "needToResetStm32 is missing in JSON" << std::endl;
            needToResetStm32 = DFT_NEED_RESET_STM32;
        }
    } else {
        // If file not exist assign default value
        Kp = DFT_KP;
        Ki = DFT_KI;
        Kd = DFT_KD;
        setPoint = DFT_SETPOINT;
        sampleTime = DFT_SAMPLE_TIME;
        intervalTime = DFT_INTERVAL_TIME;
        needToResetStm32 = DFT_NEED_RESET_STM32;
    }

    jsonData["Kp"] = Kp;
    jsonData["Ki"] = Ki;
    jsonData["Kd"] = Kd;
    jsonData["setPoint"] = setPoint;
    jsonData["sampleTime"] = sampleTime;
    jsonData["intervalTime"] = intervalTime;
    jsonData["needToResetStm32"] = needToResetStm32;

    // Write value to json file
    std::ofstream output_file(TUNE_PID_JSON_PATH);
    if (output_file.is_open()) {
        output_file << jsonData.dump(4);
        output_file.close();
    } else {
        std::cout << "Failed to open " << TUNE_PID_JSON_PATH << " JSON file for writing." << std::endl;
    }

    printCurrentVariable();
}

bool updateJSON(const std::string& filename, const std::string& key, const nlohmann::json& value) {
    std::ifstream jsonFile(filename);
    if (!jsonFile.is_open()) {
        std::cerr << "Failed to open file: " << filename << std::endl;
        return false;
    }

    nlohmann::json jsonData;
    jsonFile >> jsonData;
    jsonFile.close();

    jsonData[key] = value;

    std::ofstream output_file(filename);
    if (!output_file.is_open()) {
        std::cerr << "Failed to open file for writing: " << filename << std::endl;
        return false;
    }

    output_file << jsonData.dump(4);
    output_file.close();

    return true;
}

int Compute(void) {
    Output_valve = 0;
    adc_device tmpAdcDevice;
    dac_device newDacDevice;
    int res = 0;
    double tmpKp, tmpKi, tmpKd, tmpSetPoint;
    unsigned int tmpSampleTime;    //ms

    tmpSetPoint = setPoint;
    tmpKp = Kp;
    tmpKi = Ki;
    tmpKd = Kd;
    tmpSampleTime = sampleTime;

    saveLogToFile("============== Enter Compute() =================\n");
    saveLogToFile("Current", " setPoint: ", tmpSetPoint, " Kp: ", tmpKp, " Ki: ", tmpKi , " Kd: ", tmpKd);
    saveLogToFile("       ", " sampleTime: ", tmpSampleTime, " intervalTime: ", intervalTime);

    if (false == halLock(std::chrono::milliseconds(DFT_HAL_SPINLOCK_TIMEOUT)))
    {
        return -EBUSY;
    }
    res = adcDeviceGet(halHandler, &tmpAdcDevice);
    halUnlock();
    if (0 == res) {
        saveLogToFile("adcDeviceGet failed");
        std::cout << "adcDeviceGet failed" << std::endl;
        return -1;
    } else {
        saveLogToFile("flow 2 = ", tmpAdcDevice.flow2, " LPM");
        Process_value = tmpAdcDevice.flow2;
    }

    /*Compute all the working error variables*/
    error = tmpSetPoint - Process_value;
    if (showDetail) {
        saveLogToFile("error = ", error);
    }
    dInput = (Process_value - lastPV);
    if (showDetail) {
        saveLogToFile("dInput = ", dInput);
    }

    //compute P-term
    Output_valve += tmpKp * error;
    if (showDetail) {
        saveLogToFile("compute P-term, Output_valve = ", Output_valve);
    }

    //compute I-term
    Iterm += (tmpKi * error) * tmpSampleTime;
    Output_valve += Iterm;
    if (showDetail) {
        saveLogToFile("compute I-term, Iterm = ", Iterm, " Output_valve = ", Output_valve);
    }

    //compute D-term
    Output_valve -= tmpKd * dInput;
    if (showDetail) {
        saveLogToFile("compute D-term, Output_valve = ", Output_valve);
    }

    if (Output_valve > HAL_DAC_MVOL_MAX) {
        Output_valve = HAL_DAC_MVOL_MAX;
    } else if (Output_valve < HAL_DAC_MVOL_MIN) {
        Output_valve = HAL_DAC_MVOL_MIN;
    }

    saveLogToFile("Final Output_valve = ", Output_valve);

    newDacDevice.mVol = Output_valve;

    if (false == halLock(std::chrono::milliseconds(DFT_HAL_SPINLOCK_TIMEOUT)))
    {
        return -EBUSY;
    }
    res = dacDeviceSet(halHandler, &newDacDevice);
    halUnlock();
    if (0 == res) {
        saveLogToFile("dacDeviceSet failed");
        std::cout << "dacDeviceSet failed" << std::endl;
        return -1;
    } else {
        saveLogToFile("Set DAC mVol to ", newDacDevice.mVol);
    }

    lastPV = Process_value;
    if (showDetail) {
        saveLogToFile("Update lastPV to ", lastPV);
    }
    saveLogToFile("============== Leave Compute() =================\n");

    return 0;
}

void pidHandler(void) {
    auto lastTime = std::chrono::high_resolution_clock::now();

    while (!terminateThread) {
        auto currentTime = std::chrono::high_resolution_clock::now();

        auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(currentTime - lastTime).count();

        if (duration >= sampleTime && !isResettingStm32 && !isManualMode && (halHandler >= 0)) {
            isComputeRunning = true;
            Compute();
            isComputeRunning = false;
            lastTime = currentTime;
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

bool isServiceRunning(const std::string& serviceName) {
    std::string command = "systemctl is-active " + serviceName + " 2>&1";
    std::array<char, 128> buffer{};
    std::string result;
    std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(command.c_str(), "r"), pclose);

    if (!pipe) {
        throw std::runtime_error("popen() failed!");
    }

    while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr) {
        result += buffer.data();
    }

    return result == "active\n";
}

int resetStm32() {
    std::string sysCommand;
    isResettingStm32 = true;

    std::cout << "Start to reset STM32 and related services..." << std::endl;

    std::cout << "Stop " << SYSTEMD_IOSERVICE_SERVICE << " service..." << std::endl;
    sysCommand = std::string(SYSTEMD_STOP_SERVICE) + std::string(SYSTEMD_IOSERVICE_SERVICE);
    if (0 != system(sysCommand.c_str()))
    {
        std::cout << sysCommand << " failed" << std::endl;
        return -1;
    }

    try
    {
        gpiod::chip chip("gpiochip0");

        gpiod::line line = chip.get_line(GPIOY0_LINE_NUM);

        line.request({CONSUMER, gpiod::line_request::DIRECTION_OUTPUT}, 1);

        std::cout << "Set GPIOY0 to low" << std::endl;
        line.set_value(0);
        std::cout << "Wait STM32 for " << DEF_RESET_STM32_TIME << " ms" << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(DEF_RESET_STM32_TIME));

        std::cout << "Set GPIOY0 to high" << std::endl;
        line.set_value(1);
        std::cout << "Wait STM32 for " << DEF_RESET_STM32_TIME << " ms" << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(DEF_RESET_STM32_TIME));
    }
    catch (const std::exception& e) {
        std::cerr << "An error occurred: " << e.what() << std::endl;
        return -1;
    }

    std::cout << "Start " << SYSTEMD_IOSERVICE_SERVICE << " service..." << std::endl;
    sysCommand = std::string(SYSTEMD_START_SERVICE) + std::string(SYSTEMD_IOSERVICE_SERVICE);
    if (0 != system(sysCommand.c_str()))
    {
        std::cout << sysCommand << " failed" << std::endl;
        return -1;
    }
    std::cout << "Wait for " << SYSTEMD_IOSERVICE_SERVICE << "to be ready..." << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(DEF_RESET_STM32_TIME));
    isResettingStm32 = false;
    return 0;
}

char getCharWithoutEnter() {
    struct termios oldt, newt;
    char ch;
    tcgetattr(STDIN_FILENO, &oldt);
    newt = oldt;
    newt.c_lflag &= ~(ICANON | ECHO);
    tcsetattr(STDIN_FILENO, TCSANOW, &newt);
    ch = getchar();
    tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
    return ch;
}

bool readIntNumber(int& intValue) {
    std::string input;

    while (true) {
        char ch = getCharWithoutEnter();
        if (ch == 'Q' || ch == 'q') {
            return false;
        } else if (ch == '\n') {
            break;
        }
        input += ch;
    }

    std::stringstream ss(input);
    if (!(ss >> intValue)) {
        std::cout << "Invalid parameters " << input << std::endl;
        return false;
    }
    return true;
}

bool readDoubleNumber(double& doubleValue) {
    std::string input;

    while (true) {
        char ch = getCharWithoutEnter();
        if (ch == 'Q' || ch == 'q') {
            return false;
        } else if (ch == '\n') {
            break;
        }
        input += ch;
    }

    std::stringstream ss(input);
    if (!(ss >> doubleValue)) {
        std::cerr << "錯誤的輸入。" << std::endl;
        return false;
    }
    return true;
}

int main(int argc, char* argv[]) {
    char mode = 'n', ori_ch, ch;
    std::string input;
    std::string sysCommand;

    // // Stop & disable Insyde related services
    // sysCommand = std::string(SYSTEMD_STOP_SERVICE) + std::string(SYSTEMD_STM32IO_SERVICE);
    // if (0 != system(sysCommand.c_str()))
    // {
    //     std::cout << sysCommand << " failed" << std::endl;
    // }

    // sysCommand = std::string(SYSTEMD_STOP_SERVICE) + std::string(SYSTEMD_STM32SENSOR_SERVICE);
    // if (0 != system(sysCommand.c_str()))
    // {
    //     std::cout << sysCommand << " failed" << std::endl;
    // }

    // sysCommand = std::string(SYSTEMD_DISABLE_SERVICE) + std::string(SYSTEMD_STM32IO_SERVICE);
    // if (0 != system(sysCommand.c_str()))
    // {
    //     std::cout << sysCommand << " failed" << std::endl;
    // }

    // sysCommand = std::string(SYSTEMD_DISABLE_SERVICE) + std::string(SYSTEMD_STM32SENSOR_SERVICE);
    // if (0 != system(sysCommand.c_str()))
    // {
    //     std::cout << sysCommand << " failed" << std::endl;
    // }

    initVariable();

    if (needToResetStm32) {
        std::cout << "Need to reset STM32 when exec tunePid..." << std::endl;
        if (0 != resetStm32()) {
            std::cout << "Reset STM32 failed" << std::endl;
        } else {
            std::cout << "Reset STM32 success" << std::endl;
        }
    }

    if (false == isServiceRunning(SYSTEMD_IOSERVICE_SERVICE)) {
        std::cout << "Restart " << SYSTEMD_IOSERVICE_SERVICE << " service" << std::endl;
        sysCommand = std::string(SYSTEMD_RESTART_SERVICE) + std::string(SYSTEMD_IOSERVICE_SERVICE);
        if (0 != system(sysCommand.c_str()))
        {
            std::cout << sysCommand << " failed" << std::endl;
        }

        std::cout << "Wait " << DEF_RESET_STM32_TIME << " ms for " << SYSTEMD_IOSERVICE_SERVICE << " service" << std::endl;
        boost::this_thread::sleep_for(boost::chrono::milliseconds(DEF_RESET_STM32_TIME));
    }

    if (false == halLock(std::chrono::milliseconds(DFT_HAL_SPINLOCK_TIMEOUT)))
    {
        return -EBUSY;
    }
    halHandler = ioHalInit();
    halUnlock();
    if (halHandler < 0) {
        std::cout << "ioHalInit failed, please reset !!!!" << std::endl;
    }

    std::thread pidHandlerThread = std::thread(pidHandler);

    while (true) {
        if (mode == 'n') {
            while (true) {
                std::cout << std::endl << "========================================" << std::endl;
                std::cout << "Waiting for parameters..." << std::endl;
                std::cout << "l, Print all current setting and reading" << std::endl;
                std::cout << "p, Setup Kp" << std::endl;
                std::cout << "i, Setup Ki" << std::endl;
                std::cout << "d, Setup Kd" << std::endl;
                std::cout << "s, Setup setPoint" << std::endl;
                std::cout << "t, Setup sampleTime (ms)" << std::endl;
                std::cout << "h, Setup the interval time for HAL function (ms)" << std::endl;
                std::cout << "r, Reset STM32 and related services" << std::endl;
                std::cout << "m, Enter manual mode" << std::endl;
                std::cout << "v, Enable / Disabl detail log" << std::endl;
                std::cout << "q, Quit this utility" << std::endl;
                std::cout << "========================================" << std::endl << std::endl;

                ori_ch = getCharWithoutEnter();

                ch = std::tolower(ori_ch);
                if (ch == 'l' ||
                    ch == 'p' ||
                    ch == 'i' ||
                    ch == 'd' ||
                    ch == 's' ||
                    ch == 't' ||
                    ch == 'h' ||
                    ch == 'r' ||
                    ch == 'm' ||
                    ch == 'v' ||
                    ch == 'q') {
                    mode = ch;
                    break;
                } else {
                    std::cout << "Invalid parameters " << ori_ch << std::endl;
                }
            }
        }

        if (mode == 'l') {
            printCurrentVariable();
            mode = 'n';
        }

        if (mode == 'p') {
            while (true) {
                std::cout << "Please enter Kp value or q to quit: ";
                std::string input;
                bool exitFlag = false;

                while (true) {
                    char ch = getCharWithoutEnter();
                    if (ch == 'Q' || ch == 'q') {
                        exitFlag = true;
                        std::cout << std::endl << "Quit" << std::endl;
                        break;
                    } else if (ch == '\n') {
                        break;
                    }
                    input += ch;
                }
                if (exitFlag) {
                    mode = 'n';
                    break;
                }

                std::cout << input << std::endl;

                std::stringstream ss(input);
                double doubleNum;
                if (ss >> doubleNum) {
                    Kp = doubleNum;
                    updateJSON(TUNE_PID_JSON_PATH, "Kp", Kp);
                    std::cout << "Update Kp: " << Kp << std::endl;
                } else {
                    std::cout << "Invalid parameters " << input << std::endl;
                }
            }
        }

        if (mode == 'i') {
            while (true) {
                std::cout << "Please enter Ki value or q to quit: ";
                std::string input;
                bool exitFlag = false;

                while (true) {
                    char ch = getCharWithoutEnter();
                    if (ch == 'Q' || ch == 'q') {
                        exitFlag = true;
                        std::cout << std::endl << "Quit" << std::endl;
                        break;
                    } else if (ch == '\n') {
                        break;
                    }
                    input += ch;
                }
                if (exitFlag) {
                    mode = 'n';
                    break;
                }

                std::cout << input << std::endl;

                std::stringstream ss(input);
                double doubleNum;
                if (ss >> doubleNum) {
                    Ki = doubleNum;
                    updateJSON(TUNE_PID_JSON_PATH, "Ki", Ki);
                    std::cout << "Update Ki: " << Ki << std::endl;
                } else {
                    std::cout << "Invalid parameters " << input << std::endl;
                }
            }
        }

        if (mode == 'd') {
            while (true) {
                std::cout << "Please enter Kd value or q to quit: ";
                std::string input;
                bool exitFlag = false;

                while (true) {
                    char ch = getCharWithoutEnter();
                    if (ch == 'Q' || ch == 'q') {
                        exitFlag = true;
                        std::cout << std::endl << "Quit" << std::endl;
                        break;
                    } else if (ch == '\n') {
                        break;
                    }
                    input += ch;
                }
                if (exitFlag) {
                    mode = 'n';
                    break;
                }

                std::cout << input << std::endl;

                std::stringstream ss(input);
                double doubleNum;
                if (ss >> doubleNum) {
                    Kd = doubleNum;
                    updateJSON(TUNE_PID_JSON_PATH, "Kd", Kd);
                    std::cout << "Update Kd: " << Kd << std::endl;
                } else {
                    std::cout << "Invalid parameters " << input << std::endl;
                }
            }
        }

        if (mode == 's') {
            while (true) {
                std::cout << "Please enter setPoint value or q to quit: ";
                std::string input;
                bool exitFlag = false;

                while (true) {
                    char ch = getCharWithoutEnter();
                    if (ch == 'Q' || ch == 'q') {
                        exitFlag = true;
                        std::cout << std::endl << "Quit" << std::endl;
                        break;
                    } else if (ch == '\n') {
                        break;
                    }
                    input += ch;
                }
                if (exitFlag) {
                    mode = 'n';
                    break;
                }

                std::cout << input << std::endl;

                std::stringstream ss(input);
                double doubleNum;
                if (ss >> doubleNum) {
                    if (doubleNum < HAL_FLOW_MIN || doubleNum > HAL_FLOW_MAX) {
                        std::cout << input << " out of range" << std::endl;
                    } else {
                        setPoint = doubleNum;
                        updateJSON(TUNE_PID_JSON_PATH, "setPoint", setPoint);
                        std::cout << "Update setPoint: " << setPoint << " LPM" << std::endl;
                    }
                } else {
                    std::cout << "Invalid parameters " << input << std::endl;
                }
            }
        }

        if (mode == 't') {
            while (true) {
                std::cout << "Please enter sampleTime value or q to quit: ";
                std::string input;
                bool exitFlag = false;

                while (true) {
                    char ch = getCharWithoutEnter();
                    if (ch == 'Q' || ch == 'q') {
                        exitFlag = true;
                        std::cout << std::endl << "Quit" << std::endl;
                        break;
                    } else if (ch == '\n') {
                        break;
                    }
                    input += ch;
                }
                if (exitFlag) {
                    mode = 'n';
                    break;
                }

                std::cout << input << std::endl;

                std::stringstream ss(input);
                int intNum;
                if (ss >> intNum) {
                    if (intNum < 0) {
                        std::cout << input << " out of range" << std::endl;
                    } else {
                        sampleTime = intNum;
                        updateJSON(TUNE_PID_JSON_PATH, "sampleTime", sampleTime);
                        std::cout << "Update sampleTime: " << sampleTime << " ms" << std::endl;
                    }
                } else {
                    std::cout << "Invalid parameters " << input << std::endl;
                }
            }
        }

        if (mode == 'h') {
            while (true) {
                std::cout << "Please enter intervalTime value or q to quit: ";
                std::string input;
                bool exitFlag = false;

                while (true) {
                    char ch = getCharWithoutEnter();
                    if (ch == 'Q' || ch == 'q') {
                        exitFlag = true;
                        std::cout << std::endl << "Quit" << std::endl;
                        break;
                    } else if (ch == '\n') {
                        break;
                    }
                    input += ch;
                }
                if (exitFlag) {
                    mode = 'n';
                    break;
                }

                std::cout << input << std::endl;

                std::stringstream ss(input);
                int intNum;
                if (ss >> intNum) {
                    if (intNum < 0) {
                        std::cout << input << " out of range" << std::endl;
                    } else {
                        intervalTime = intNum;
                        updateJSON(TUNE_PID_JSON_PATH, "intervalTime", intervalTime);
                        std::cout << "Update intervalTime: " << intervalTime << " ms" << std::endl;
                    }
                } else {
                    std::cout << "Invalid parameters " << input << std::endl;
                }
            }
        }

        if (mode == 'r') {
            int ret;

            if (0 != (ret = resetStm32())) {
                std::cout << "Reset STM32 failed" << std::endl;
            } else {
                std::cout << "Reset STM32 success" << std::endl;
            }

            if (false == halLock(std::chrono::milliseconds(DFT_HAL_SPINLOCK_TIMEOUT)))
            {
                return -EBUSY;
            }
            halHandler = ioHalInit();
            halUnlock();
            if (halHandler < 0) {
                std::cout << "ioHalInit failed, please reset !!!!" << std::endl;
            }

            mode = 'n';
        }

        if (mode == 'm') {
            int ret;
            dac_device newDacDevice;
            isManualMode = true;
            std::cout << "Enter the manual mode..." << std::endl;
            if (isComputeRunning == true) {
                std::cout << "Wait for Compute() to finish..." << std::endl;
                while (isComputeRunning == true) {
                    std::this_thread::sleep_for(std::chrono::milliseconds(100));
                }
            }

            while (true) {
                std::cout << "Please enter DAC mVol value or q to quit: ";
                std::string input;
                bool exitFlag = false;

                while (true) {
                    char ch = getCharWithoutEnter();
                    if (ch == 'Q' || ch == 'q') {
                        exitFlag = true;
                        std::cout << std::endl << "Quit" << std::endl;
                        break;
                    } else if (ch == '\n') {
                        break;
                    }
                    input += ch;
                }
                if (exitFlag) {
                    mode = 'n';
                    isManualMode = false;
                    break;
                }

                std::cout << input << std::endl;

                std::stringstream ss(input);
                int intNum;
                if (ss >> intNum) {
                    if (intNum < HAL_DAC_MVOL_MIN || intNum > HAL_DAC_MVOL_MAX) {
                        std::cout << input << " out of range("
                                    << HAL_DAC_MVOL_MIN << "~" << HAL_DAC_MVOL_MAX
                                                        << ")" << std::endl;
                    } else {
                        newDacDevice.mVol = intNum;
                        if (false == halLock(std::chrono::milliseconds(DFT_HAL_SPINLOCK_TIMEOUT)))
                        {
                            std::cout << "failed, HAL spin lock timeout" << std::endl;
                            continue;
                        }
                        ret = dacDeviceSet(halHandler, &newDacDevice);
                        halUnlock();
                        if (0 == ret) {
                            std::cout << "dacDeviceSet failed" << std::endl;
                            return -1;
                        } else {
                            std::cout << "Set DAC mVol to " << newDacDevice.mVol << std::endl;
                        }
                    }
                } else {
                    std::cout << "Invalid parameters " << input << std::endl;
                }
            }
        }

        if (mode == 'v') {
            showDetail = !showDetail;
            std::cout << "showDetail: " << showDetail << std::endl;
            mode = 'n';
        }

        if (mode == 'q') {
            terminateThread = true;
            if (pidHandlerThread.joinable())
            {
                pidHandlerThread.join();
            }
            return 0;
        }
    }
}