#include "configuration.hpp"

#include <fstream>
#include <sstream>
#include <filesystem>
#include <modbus/modbus.h>
#include <phosphor-logging/log.hpp>

#define ALIGN(x,a)              __ALIGN_MASK(x,(typeof(x))(a)-1)
#define __ALIGN_MASK(x,mask)    (((x)+(mask))&~(mask))

Configuration::Configuration(std::string path) :
    _path(path)
{
    if (std::filesystem::exists(_path))
    {
        try
        {
            std::ifstream cfg_file;

            cfg_file.open(_path, std::ifstream::in);
            if ((cfg_file.bad() != true) && (cfg_file.peek() != EOF))
            {
                nlohmann::json cfg_json;
                cfg_json = nlohmann::json::parse(cfg_file);
                if (!cfg_json.empty())
                {
                    auto list = cfg_json["list"];
                    auto count = 0;
                    for (nlohmann::json::iterator it = list.begin(); it != list.end(); ++it, count++) {
                        ModbusDbusMapping cur_obj_info{};
                        int regType;
                        cur_obj_info.isSigned = false;
                        cur_obj_info.readingScale = DEF_READING_SCALE;

                        for (nlohmann::json::iterator iit = it->begin(); iit != it->end(); ++iit) {

                            if (iit.key() == type_field)
                            {
                                regType = get_reg_type_from_name(iit.value());
                            }

                            if (iit.key() == addr_field)
                            {
                                cur_obj_info.addr = iit.value();
                            }

                            if (iit.key() == srv_field)
                            {
                                cur_obj_info.service = iit.value();
                            }

                            if (iit.key() == obj_field)
                            {
                                cur_obj_info.object = iit.value();
                            }

                            if (iit.key() == if_field)
                            {
                                cur_obj_info.interface = iit.value();
                            }

                            if (iit.key() == propty_field)
                            {
                                cur_obj_info.property = iit.value();
                            }

                            if (iit.key() == len_field)
                            {
                                cur_obj_info.length = iit.value();
                            }

                            if (iit.key() == signed_field)
                            {
                                cur_obj_info.isSigned = iit.value();
                            }

                            if (iit.key() == reading_scale_field)
                            {
                                cur_obj_info.readingScale = iit.value();
                            }
                        }

                        if (cur_obj_info.length == 0) {
                            if (regType == static_cast<int>(ModbusRegType::MODBUS_COIL) ||
                                    regType == static_cast<int>(ModbusRegType::MODBUS_DISCRETE_INPUT)) {
                                cur_obj_info.length = default_coil_size;
                            }
                            else if (regType == static_cast<int>(ModbusRegType::MODBUS_INPUT_REGISTER) ||
                                        regType == static_cast<int>(ModbusRegType::MODBUS_HOLDING_REGISTER)) {
                                cur_obj_info.length = default_register_size;
                            }
                        }

                        if (!isValid(cur_obj_info, regType)) {
                            continue;
                        }

                        std::cout << ("regType: " + std::to_string(regType) +
                            ", regTypeCnt: " + std::to_string(regTypeCnt[regType]) +
                            ", isSigned: " + std::to_string(cur_obj_info.isSigned)).c_str() << std::endl;
                        phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        ("regType: " + std::to_string(regType) +
                            ", regTypeCnt: " + std::to_string(regTypeCnt[regType]) +
                            ", isSigned: " + std::to_string(cur_obj_info.isSigned)).c_str());

                        cur_obj_info.regTypeIndex = regTypeCnt[regType];
                        _regs[regType][regTypeCnt[regType]++] = cur_obj_info;
                    }
                    phosphor::logging::log<phosphor::logging::level::INFO>(
                        (("There " + std::to_string(count) + " mapping found in config").c_str()));
                }
                cfg_file.close();
            }
        }
        catch (nlohmann::json::exception& e)
        {
            phosphor::logging::log<phosphor::logging::level::ERR>(
                ("Configuration:Json error" + std::string(e.what()))
                .c_str());
            throw std::runtime_error("Configuration:Json error");
        }
    }
    else {
        phosphor::logging::log<phosphor::logging::level::ERR>(
                "Configuration not existed");
        throw std::runtime_error("Configuration not existed");
    }
}

Configuration::~Configuration()
{
}

bool Configuration::lookup_dbus_info(ModbusRegType regType, uint16_t addr, const ModbusDbusMapping **info)
{
    if (info == nullptr)
    {
        return false;
    }

    std::cout << ("lookup_dbus_info regType: " + std::to_string(static_cast<int>(regType)) + ", addr: " + std::to_string(addr)).c_str() << std::endl;
    phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        ("lookup_dbus_info regType: " + std::to_string(static_cast<int>(regType)) + ", addr: " + std::to_string(addr)).c_str());
    auto regTypeIt = _regs.find(static_cast<int>(regType));
    if (regTypeIt != _regs.end())
    {
        const reg_info_pre& preMap = regTypeIt->second;
        for (const auto& pair : preMap)
        {
            if (pair.first == addr)
            {
                *info = &(pair.second);
                return true;
            }
        }
    }

    return false;
}

int Configuration::get_reg_number_by_bits(int length) {
    int aligned = ALIGN(length, 16);

    std::cout << ("length " + std::to_string(length) + " aligned to " + std::to_string(aligned)).c_str() << std::endl;
    phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        ("length " + std::to_string(length) + " aligned to " + std::to_string(aligned)).c_str());

    return aligned/16;
}

int Configuration::get_reg_type_from_name(std::string name)
{
    if (name == coil_type) {
        return static_cast<int>(ModbusRegType::MODBUS_COIL);
    }
    else if (name == in_coil_type) {
        return static_cast<int>(ModbusRegType::MODBUS_DISCRETE_INPUT);
    }
    else if (name == in_reg_type) {
        return static_cast<int>(ModbusRegType::MODBUS_INPUT_REGISTER);
    }
    else if (name == reg_type) {
        return static_cast<int>(ModbusRegType::MODBUS_HOLDING_REGISTER);
    }
    phosphor::logging::log<phosphor::logging::level::ERR>(
        ("The Type field is wrong" + name).c_str());

    return static_cast<int>(ModbusRegType::MODBUS_REG_TYPE_MAX);
}

bool Configuration::isValid(const ModbusDbusMapping &info, int regType)
{
    if (info.service.empty() || info.object.empty() ||
        info.interface.empty() || info.property.empty()) {
        return false;
    }

    if (info.length == 0 || regType == static_cast<int>(ModbusRegType::MODBUS_REG_TYPE_MAX)) {
        return false;
    }

    return true;
}
