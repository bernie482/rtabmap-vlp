#include <CLI/CLI.hpp>
#include "server.hpp"

int main(int argc, char* argv[])
{
    int port = 502;
    int max = 10;
    int timeout = 300;
    std::string ip = "0.0.0.0";
    std::string cfg_path = "/nv/modbus-tcp-server.json";

    CLI::App app("Modbus TCP Server, version 0.0.1");
    app.add_option("-p,--port", port, "port, default 502");
    app.add_option("-i,--ip", ip, "ip, default 0.0.0.0");
    app.add_option("-m,--max", max, "max connection queue depth, default 10");
    app.add_option("-t,--timeout", timeout, "timeout in ms, default 300");
    app.add_option("-c,--config-path", cfg_path, "path of dbus configuration, default /nv/modbus-tcp-server.json");
    CLI11_PARSE(app, argc, argv);

    boost::asio::io_service io;

    server server(io, ip, port, max, timeout, cfg_path);

    io.run();

    return 0;
}
