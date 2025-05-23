#pragma once

#include <string>
#include <stdexcept>
#include <sys/epoll.h>
#include <modbus/modbus.h>
#include <boost/asio/io_service.hpp>
#include <boost/asio/steady_timer.hpp>
#include <boost/asio/spawn.hpp>
#include "dbus_trans_queue.hpp"
#include <phosphor-logging/log.hpp>
#include <sdbusplus/asio/object_server.hpp>
#include <sdbusplus/bus.hpp>
#include <boost/asio/posix/stream_descriptor.hpp>
#include <variant>
#include <future>

#define MAX_EVENTS 10

class server
{
    public:
        server(boost::asio::io_service& io, std::string ip,
            int port, int max, int timeout, std::string path);
        ~server();

        void pollRx();
        void listen_poll();
        void add_to_epoll(int fd);
        void delete_from_epoll(int fd);
        void response_exception_reply(int fd, std::vector<uint8_t> payload, int exception_code);
        void request_handler(int fd, uint8_t *req, int req_len);
        std::future<int> request_handler_single(int fd, int addr, int funcType,
                                    std::vector<uint8_t> payload);
        int update_register(int fd, int funcType, uint16_t addr);
        bool getAddressAndFuncType(uint16_t &addr, int &funcType, int &numRegister, std::vector<uint8_t> req);
        // int get_variant_value(uint64_t &data, int length, DbusValue &value);

    private:
        int _port;
        int _timeout;
        std::string _ip;
        int _max_connection;
        int _listen_socket = -1;
        int _epollfd = -1;
        modbus_t *_ctx = NULL;
        modbus_mapping_t *_mb_mapping = NULL;

        std::shared_ptr<sdbusplus::asio::connection> _conn = nullptr;
        sdbusplus::bus::bus _bus;
        std::shared_ptr<DbusTransQueue> trans_queue = nullptr;

        boost::asio::io_context& _io;
        boost::asio::posix::stream_descriptor _streamMonitor;

};