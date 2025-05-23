#pragma once

#include <map>
#include <iostream>
#include <optional>
#include <vector>
#include <variant>
#include <phosphor-logging/log.hpp>
#include <boost/asio/io_context.hpp>
#include <boost/asio/steady_timer.hpp>
#include <sdbusplus/asio/object_server.hpp>
#include <sdbusplus/bus.hpp>
#include <condition_variable>

#include "configuration.hpp"

using DbusValue = std::variant<bool, uint8_t, uint16_t, uint32_t, uint64_t>;

class DbusTransQueue : public Configuration
{
    public:
        DbusTransQueue(std::shared_ptr<sdbusplus::asio::connection> conn,
                    std::string _path);

        struct Message
        {
            Message(size_t index_, boost::asio::io_context& ioc);

            size_t index{0};
            int client_fd;
            boost::asio::steady_timer timer;
            const ModbusDbusMapping *dbus_info = nullptr;
            int64_t new_value;
            boost::system::error_code ec;
        };

        std::shared_ptr<Message> transmit(int fd, sdbusplus::bus::bus& bus, ModbusRegType regType,
                                        uint16_t addr, boost::asio::io_context& ioc);
        bool receive(int fd, size_t msgIndx);
        void dispose(int fd, const std::shared_ptr<Message>& message);
        void get_dbus_value(int fd, sdbusplus::bus::bus& bus, const std::shared_ptr<Message>& message);

    private:
        struct Client
        {
            std::map<size_t, std::shared_ptr<Message>> transmittedMessages{};
            std::map<size_t, std::shared_ptr<Message>> queuedMessages{};

            size_t msgCounter{0u};
            void transmitQueuedMessages(int fd);
        };

        std::map<int, Client> clients{};

        std::shared_ptr<sdbusplus::asio::connection> _conn = nullptr;
};