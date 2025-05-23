#include "server.hpp"

server::server(boost::asio::io_service& io, std::string ip, int port,
                int max, int timeout, std::string path) :
    _io(io), _ip(ip), _port(port), _max_connection(max), _timeout(timeout), _streamMonitor(io), _bus(sdbusplus::bus::new_default())
{
    _conn = std::make_shared<sdbusplus::asio::connection>(_io);
    trans_queue = std::make_shared<DbusTransQueue>(_conn, path);

    _ctx = modbus_new_tcp(_ip.c_str(), _port);
    if (_ctx == NULL) {
        phosphor::logging::log<phosphor::logging::level::ERR>(
            (std::string("Failed to create new tcp: ") + modbus_strerror(errno)).c_str());
        throw std::runtime_error("Failed to create new tcp");
    }

    _mb_mapping = modbus_mapping_new(trans_queue->regTypeCnt[static_cast<int>(ModbusRegType::MODBUS_COIL)],
                                        trans_queue->regTypeCnt[static_cast<int>(ModbusRegType::MODBUS_DISCRETE_INPUT)],
                                        trans_queue->regTypeCnt[static_cast<int>(ModbusRegType::MODBUS_HOLDING_REGISTER)],
                                        trans_queue->regTypeCnt[static_cast<int>(ModbusRegType::MODBUS_INPUT_REGISTER)]);
    if (_mb_mapping == NULL) {
        phosphor::logging::log<phosphor::logging::level::ERR>(
            (std::string("Failed to allocate the mapping: ") + modbus_strerror(errno)).c_str());
        modbus_free(_ctx);
        throw std::runtime_error("Failed to allocate the mapping");
    }

    _epollfd = epoll_create1(0);
    if (_epollfd == -1)
        throw std::runtime_error("Failed to epoll_create1");

    _listen_socket = modbus_tcp_listen(_ctx, _max_connection);
    if (_listen_socket == -1)
        throw std::runtime_error("Failed to modbus_tcp_listen");

    add_to_epoll(_listen_socket);

    _streamMonitor.assign(_epollfd);

    pollRx();
}

server::~server()
{
    _streamMonitor.release();

    modbus_mapping_free(_mb_mapping);

    if (_listen_socket != -1) {
        close(_listen_socket);
    }

    if (_epollfd != -1) {
        close(_epollfd);
    }

    /* For RTU, skipped by TCP (no TCP connect) */
    modbus_close(_ctx);
    modbus_free(_ctx);
}

void server::add_to_epoll(int fd)
{
    struct epoll_event ev;
    ev.events = EPOLLIN;
    ev.data.fd = fd;

    if (epoll_ctl(_epollfd, EPOLL_CTL_ADD, fd, &ev) == -1)
        phosphor::logging::log<phosphor::logging::level::ERR>(
            "Failed to EPOLL_CTL_ADD");
}

void server::delete_from_epoll(int fd)
{
    if (epoll_ctl(_epollfd, EPOLL_CTL_DEL, fd, NULL) == -1)
        phosphor::logging::log<phosphor::logging::level::ERR>(
            "Failed to EPOLL_CTL_DEL");
}

void server::pollRx()
{
    _streamMonitor.async_wait(
        boost::asio::posix::stream_descriptor::wait_read,
        [this](const boost::system::error_code& ec) {
            if (ec)
            {
                phosphor::logging::log<phosphor::logging::level::ERR>(
                    "Error reading data");
                return;
            }
            listen_poll();

            pollRx();
        });
}

void server::listen_poll()
{
    struct epoll_event events[MAX_EVENTS];
    int nfds;

    nfds = epoll_wait(_epollfd, events, MAX_EVENTS, 0);
    if (nfds <= 0) {
        phosphor::logging::log<phosphor::logging::level::ERR>(
            "epoll_wait error");
        return;
    }

    for (int i=0 ; i<nfds ; i++) {
        if (events[i].data.fd == _listen_socket) {
            int client = modbus_tcp_accept(_ctx, &_listen_socket);
            if (client != -1) {
                add_to_epoll(client);
                std::cout << (("client: " + std::to_string(client)) + " connected").c_str() << std::endl;
                phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        (("client: " + std::to_string(client)) + " connected").c_str());
            }
        }
        else {
            modbus_set_socket(_ctx, events[i].data.fd);
            uint8_t query[MODBUS_TCP_MAX_ADU_LENGTH];
            int rc = modbus_receive(_ctx, query);
            if (rc > 0) {
                request_handler(events[i].data.fd, query, rc);
            }
            else if (rc  == -1) {
                delete_from_epoll(events[i].data.fd);
                std::cout << (("client: " + std::to_string(events[i].data.fd)) + " connection closed").c_str() << std::endl;
                phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        (("client: " + std::to_string(events[i].data.fd)) + " connection closed").c_str());
            }
        }
    }
}

std::future<int> server::request_handler_single(int fd, int addr, int funcType,
                                    std::vector<uint8_t> payload)
{
    // !TODO need a timeout mechanism
    auto promise = std::make_shared<std::promise<int>>();
    auto future = promise->get_future();
    int ret = 0;
    std::cout << ("funcType : " + std::to_string(funcType)).c_str() << std::endl;
    phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        ("funcType : " + std::to_string(funcType)).c_str());

    std::ostringstream stream;
    for (int i = 0; i < payload.size(); i++) {
        stream << std::hex << std::setw(2) << std::setfill('0')
            << static_cast<unsigned>(payload.data()[i]) << " ";
    }
    std::cout << ("payload : " + stream.str()).c_str() << std::endl;
    phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        ("payload : " + stream.str()).c_str());

    // Process 'read' and 'write' separately.
    switch (funcType) {
        case MODBUS_FC_READ_COILS:
        case MODBUS_FC_READ_DISCRETE_INPUTS:
        case MODBUS_FC_READ_HOLDING_REGISTERS:
        case MODBUS_FC_READ_INPUT_REGISTERS: {
            ret = update_register(fd, funcType, addr);
            if (ret != 0) {
                phosphor::logging::log<phosphor::logging::level::ERR>(
                        (std::string("update_register failed: ") + std::to_string(ret)).c_str());
            }
            break;
        }
        case MODBUS_FC_WRITE_SINGLE_COIL:
        case MODBUS_FC_WRITE_SINGLE_REGISTER: {
            ret = MODBUS_EXCEPTION_ILLEGAL_FUNCTION;
            break;
        }
        default: {
            ret = MODBUS_EXCEPTION_ILLEGAL_FUNCTION;
            break;
        }
    }

    promise->set_value(ret);
    return future;
}

void server::response_exception_reply(int fd, std::vector<uint8_t> payload, int exception_code)
{
    modbus_set_socket(_ctx, fd);
    modbus_reply_exception(_ctx, payload.data(), exception_code);
}

void server::request_handler(int fd, uint8_t *req, int req_len)
{
    auto request_routine = [&, fd]
        (boost::asio::yield_context yield) {
            int funcType = 0, numRegister = 0;
            uint16_t addr = 0;
            std::vector<uint8_t> payload(req, req + req_len);
            std::vector<std::future<int>> futures;

            if (getAddressAndFuncType(addr, funcType, numRegister, payload)) {
                for (int i = 0; i < numRegister; i++) {
                    std::cout << ("addr : " + std::to_string(addr) +
                            ", funcType : " + std::to_string(funcType) +
                            ", numRegister : " + std::to_string(numRegister)).c_str() << std::endl;
                    phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        ("addr : " + std::to_string(addr) +
                            ", funcType : " + std::to_string(funcType) +
                            ", numRegister : " + std::to_string(numRegister)).c_str());
                    futures.push_back(request_handler_single(fd, addr, funcType, payload));
                    addr++;
                }

                int result = 0;
                for (auto& future : futures) {
                    if (0 != (result = future.get())) {
                        modbus_set_socket(_ctx, fd);
                        response_exception_reply(fd, payload, result);
                        return;
                    }
                }
                modbus_set_socket(_ctx, fd);
                int rc = modbus_reply(_ctx, payload.data(), payload.size(), _mb_mapping);
                if (rc == -1) {
                    phosphor::logging::log<phosphor::logging::level::ERR>(
                        (std::string("modbus_reply failed: ") + modbus_strerror(errno)).c_str());
                }
                else {
                    std::cout << "modbus_reply success" << std::endl;
                    phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        "modbus_reply success");
                }
            }
    };
    boost::asio::spawn(_io, request_routine);
    return;
}

bool server::getAddressAndFuncType(uint16_t &addr, int &funcType, int &numRegister, std::vector<uint8_t> req)
{
    uint8_t *req_ptr = req.data();
    int req_size = req.size();
    int reqOffset = modbus_get_header_length(_ctx);

    if (req_size < (reqOffset + 2 + 1))
        return false;

    funcType = req_ptr[reqOffset];
    switch (funcType) {
        case MODBUS_FC_READ_COILS:
        case MODBUS_FC_READ_DISCRETE_INPUTS:
        case MODBUS_FC_READ_HOLDING_REGISTERS:
        case MODBUS_FC_READ_INPUT_REGISTERS: {
            addr = (req_ptr[reqOffset + 1] << 8) + req_ptr[reqOffset + 2];
            numRegister = (req_ptr[reqOffset + 3] << 8) + req_ptr[reqOffset + 4];
            break;
        }
        case MODBUS_FC_WRITE_MULTIPLE_COILS:
        case MODBUS_FC_WRITE_MULTIPLE_REGISTERS:
        default:
            phosphor::logging::log<phosphor::logging::level::ERR>(
                        (std::string("Unsupported function code: ") + std::to_string(funcType)).c_str());
            return false;
    }

    return true;
}

// Update the register table
int server::update_register(int fd, int funcType, uint16_t addr)
{
    int ret = 0;
    int numRegister = 0;
    boost::system::error_code ec;
    uint16_t regTypeIndex;
    // int length; // It's no functionally used, so it's not necessary to get the length
    int64_t value;
    bool isSigned;
    ModbusRegType regType;
    numRegister = 1; // Because only one address is processed at a time, it is always 1

    switch (funcType) {
        case MODBUS_FC_READ_COILS:
        case MODBUS_FC_READ_DISCRETE_INPUTS: {
                unsigned int is_input = (funcType == MODBUS_FC_READ_DISCRETE_INPUTS);
                regType = is_input ? ModbusRegType::MODBUS_DISCRETE_INPUT : ModbusRegType::MODBUS_COIL;
                int start_bits = is_input ? _mb_mapping->start_input_bits : _mb_mapping->start_bits;
                int nb_bits = is_input ? _mb_mapping->nb_input_bits : _mb_mapping->nb_bits;
                uint8_t *tab_bits = is_input ? _mb_mapping->tab_input_bits : _mb_mapping->tab_bits;

                auto message = trans_queue->transmit(fd, _bus, regType, addr, _io);

                if (ec && ec != boost::asio::error::operation_aborted) {
                    trans_queue->dispose(fd, message);
                    phosphor::logging::log<phosphor::logging::level::ERR>(
                        "Timer failed");
                    ret = MODBUS_EXCEPTION_SLAVE_OR_SERVER_FAILURE;
                    return ret;
                }

                if (!message->ec) {
                    std::cout << ("Got response value = " + std::to_string(message->new_value)).c_str() << std::endl;
                    phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        ("Got response value = " + std::to_string(message->new_value)).c_str());
                    regTypeIndex = message->dbus_info->regTypeIndex;
                    // It's no functionally used, so it's not necessary to get the length
                    // length = message->dbus_info->length;
                    value = message->new_value;
                }
                else {
                    trans_queue->dispose(fd, message);
                    phosphor::logging::log<phosphor::logging::level::ERR>(
                        "Empty response");
                    ret = MODBUS_EXCEPTION_SLAVE_OR_SERVER_FAILURE;
                    return ret;
                }

                // The start_bits must be 0, so the mapping_address is the same as regTypeIndex
                int mapping_address = regTypeIndex - start_bits;

                if (mapping_address < 0 || (mapping_address + numRegister) > nb_bits) {
                    phosphor::logging::log<phosphor::logging::level::ERR>(
                        ("Error:illegal data address " + std::to_string(addr) + " in write_bit").c_str());
                    ret = MODBUS_EXCEPTION_ILLEGAL_DATA_ADDRESS;
                    return ret;
                }
                else {
                    if (value == 0 || value == 1) {
                        tab_bits[mapping_address] = value;
                    }
                    else {
                        phosphor::logging::log<phosphor::logging::level::ERR>(
                            ("Error:illegal data value " + std::to_string(value) + " in write_bit").c_str());
                        ret = MODBUS_EXCEPTION_SLAVE_OR_SERVER_FAILURE;
                        return ret;
                    }
                }
                break;
            }

        case MODBUS_FC_READ_HOLDING_REGISTERS:
        case MODBUS_FC_READ_INPUT_REGISTERS: {
                unsigned int is_input = (funcType == MODBUS_FC_READ_INPUT_REGISTERS);
                regType = is_input ? ModbusRegType::MODBUS_INPUT_REGISTER : ModbusRegType::MODBUS_HOLDING_REGISTER;
                int start_registers = is_input ? _mb_mapping->start_input_registers : _mb_mapping->start_registers;
                int nb_registers = is_input ? _mb_mapping->nb_input_registers : _mb_mapping->nb_registers;
                uint16_t *tab_registers = is_input ? _mb_mapping->tab_input_registers : _mb_mapping->tab_registers;

                auto message = trans_queue->transmit(fd, _bus, regType, addr, _io);

                if (!message->ec) {
                    std::cout << ("Got response value = " + std::to_string(message->new_value)).c_str() << std::endl;
                    phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        ("Got response value = " + std::to_string(message->new_value)).c_str());
                    regTypeIndex = message->dbus_info->regTypeIndex;
                    // It's no functionally used, so it's not necessary to get the length
                    // length = message->dbus_info->length;
                    value = message->new_value;
                    isSigned = message->dbus_info->isSigned;
                }
                else {
                    trans_queue->dispose(fd, message);
                    phosphor::logging::log<phosphor::logging::level::ERR>(
                        "Empty response");
                    ret = MODBUS_EXCEPTION_SLAVE_OR_SERVER_FAILURE;
                    return ret;
                }

                // The start_bits must be 0, so the mapping_address is the same as regTypeIndex
                int mapping_address = regTypeIndex - start_registers;

                if (mapping_address < 0 || (mapping_address + numRegister) > nb_registers) {
                    phosphor::logging::log<phosphor::logging::level::ERR>(
                        ("Erroe:illegal data address " + std::to_string(addr) +
                        " in write_register").c_str());
                    ret = MODBUS_EXCEPTION_ILLEGAL_DATA_ADDRESS;
                    return ret;
                }
                else {
                    if (isSigned) {
                        if (value < INT16_MIN || value > INT16_MAX) {
                            phosphor::logging::log<phosphor::logging::level::ERR>(
                                ("Error:dbusObj " + message->dbus_info->object + " has illegal signed data value " + std::to_string(value) +
                                " in write_register").c_str());
                            ret = MODBUS_EXCEPTION_SLAVE_OR_SERVER_FAILURE;
                            return ret;
                        } else {
                            mapping_address += (numRegister - 1);
                            for (int i = 0; i < numRegister; i++)
                                tab_registers[mapping_address - i] = static_cast<int16_t>(value >> (i*16)) & 0xffff;
                        }
                    }
                    else {
                        if (value < 0 || value > UINT16_MAX) {
                            phosphor::logging::log<phosphor::logging::level::ERR>(
                                ("Error:dbusObj " + message->dbus_info->object + " has illegal unsigned data value " + std::to_string(value) +
                                " in write_register").c_str());
                            ret = MODBUS_EXCEPTION_SLAVE_OR_SERVER_FAILURE;
                            return ret;
                        } else {
                            mapping_address += (numRegister - 1);
                            for (int i = 0; i < numRegister; i++)
                                tab_registers[mapping_address - i] = (value >> (i*16)) & 0xffff;
                        }
                    }
                }
                break;
            }
            default:
                break;
    }
    return ret;
}