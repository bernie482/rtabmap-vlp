#include "dbus_trans_queue.hpp"

DbusTransQueue::DbusTransQueue(std::shared_ptr<sdbusplus::asio::connection> conn,
                            std::string path) :
    _conn(conn), Configuration(path)
{
}

DbusTransQueue::Message::Message(size_t index_,
                                boost::asio::io_context& ioc) :
    index(index_), timer(ioc)
{
}

std::shared_ptr<DbusTransQueue::Message> DbusTransQueue::transmit(
    int fd, sdbusplus::bus::bus& bus, ModbusRegType regType, uint16_t addr,
    boost::asio::io_context& ioc)
{
    auto& client = clients[fd];
    auto msgIndex = client.msgCounter++;
    auto message = std::make_shared<Message>(msgIndex, ioc);

    client.queuedMessages.emplace(msgIndex, message);
    client.transmitQueuedMessages(fd);

    if (lookup_dbus_info(regType, addr, &message->dbus_info)) {
        get_dbus_value(fd, bus, message);
    }
    else {
        // If there is no dbus information, fill in the error code to cause it to fail.
        message->ec = boost::system::error_code(boost::system::errc::bad_address, boost::system::generic_category());
    }
    return message;
}

void DbusTransQueue::Client::transmitQueuedMessages(int fd)
{
    while (!queuedMessages.empty())
    {
        auto queuedMessageIter = queuedMessages.begin();
        auto message = queuedMessageIter->second;
        queuedMessages.erase(queuedMessageIter);

        transmittedMessages.emplace(queuedMessageIter->first, message);
    }
}

bool DbusTransQueue::receive(int fd, size_t msgIndx)
{
    auto clientIter = clients.find(fd);
    if (clientIter == clients.end())
    {
        return false;
    }

    auto& client = clientIter->second;
    auto messageIter = client.transmittedMessages.find(msgIndx);
    if (messageIter == client.transmittedMessages.end())
    {
        return false;
    }

    const auto message = messageIter->second;
    client.transmittedMessages.erase(msgIndx);

    // Now that another tag is available, try to transmit any queued messages
    message->timer.cancel();
    _conn->get_io_context().post([this, fd] {
        clients[fd].transmitQueuedMessages(fd);
    });
    return true;
}

void DbusTransQueue::dispose(int fd, const std::shared_ptr<Message>& message)
{
    auto& client = clients[fd];
    auto queuedMessageIter = client.queuedMessages.find(message->index);
    if (queuedMessageIter != client.queuedMessages.end())
    {
        client.queuedMessages.erase(queuedMessageIter);
    }

    auto transmittedMessageIter = client.transmittedMessages.find(message->index);
    if (transmittedMessageIter != client.transmittedMessages.end())
    {
        client.transmittedMessages.erase(transmittedMessageIter);
    }
}

void DbusTransQueue::get_dbus_value(int fd, sdbusplus::bus::bus& bus, const std::shared_ptr<Message>& message)
{
    const ModbusDbusMapping *dbus_info = message->dbus_info;
    std::variant<int, double> responseVariant;

    try {
        auto msg = bus.new_method_call(dbus_info->service.c_str(), dbus_info->object.c_str(), "org.freedesktop.DBus.Properties", "Get");
        msg.append(dbus_info->interface.c_str(), dbus_info->property.c_str());
        auto reply = bus.call(msg);

        if (reply.is_method_error()) {
            std::cerr << "DBUS method call error." << std::endl;
            message->ec = boost::system::error_code(boost::system::errc::io_error, boost::system::generic_category());
            return;
        }
        reply.read(responseVariant);

        // Handle the response
        std::visit([&](auto&& arg) {
            using T = std::decay_t<decltype(arg)>;
            if constexpr (std::is_same_v<T, int>) {
                message->new_value = std::get<int>(responseVariant);
            } else if constexpr (std::is_same_v<T, double>) {
                message->new_value = static_cast<int>(std::get<double>(responseVariant));
            } else {
                phosphor::logging::log<phosphor::logging::level::ERR>(
                    "Unexpected type in responseVariant");
                message->ec = boost::system::error_code(boost::system::errc::io_error, boost::system::generic_category());
            }
        }, responseVariant);
    }
    catch (const std::exception& e) {
        phosphor::logging::log<phosphor::logging::level::ERR>(
                    ("error with callMethod" + std::string(e.what())).c_str());
        // If there is no dbus information, fill in the error code to cause it to fail.
        message->ec = boost::system::error_code(boost::system::errc::io_error, boost::system::generic_category());
        return;
    }
    std::cout << ("Get dbus value " + std::to_string(message->new_value)).c_str() << std::endl;
    phosphor::logging::log<phosphor::logging::level::DEBUG>(
                        ("Get dbus value " + std::to_string(message->new_value)).c_str());
    message->new_value = static_cast<int>(message->new_value * dbus_info->readingScale);
    this->receive(fd, message->index);
    return;

}
