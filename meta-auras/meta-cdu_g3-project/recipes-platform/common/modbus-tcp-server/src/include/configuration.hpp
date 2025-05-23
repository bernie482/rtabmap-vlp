#pragma once

#include <map>
#include <nlohmann/json.hpp>

#define DEF_READING_SCALE       1.0

struct ModbusDbusMapping
{
    std::string service;
    std::string object;
    std::string interface;
    std::string property;

    uint16_t addr;
    uint16_t regTypeIndex;
    int length;
    bool isSigned;
    double readingScale;
};

enum class ModbusRegType : int
{
    MODBUS_COIL = 0,
    MODBUS_DISCRETE_INPUT = 1,
    MODBUS_INPUT_REGISTER = 2,
    MODBUS_HOLDING_REGISTER = 3,
    MODBUS_REG_TYPE_MAX = 4
};

using reg_info_pre = std::map<uint16_t, ModbusDbusMapping>;
using reg_info = std::map<int, reg_info_pre>;

const static constexpr char *addr_field = "Address";
const static constexpr char *type_field = "Type";
const static constexpr char *srv_field = "Service";
const static constexpr char *obj_field = "Object";
const static constexpr char *if_field = "Interface";
const static constexpr char *propty_field = "Property";
const static constexpr char *len_field = "Length";
const static constexpr char *signed_field = "IsSigned";
const static constexpr char *reading_scale_field = "ReadingScale";
const static constexpr char *reg_type = "Register";
const static constexpr char *coil_type = "Coil";
const static constexpr char *in_reg_type = "In_Register";
const static constexpr char *in_coil_type = "In_Coil";
const static constexpr int default_register_size = 16; // in bits
const static constexpr int default_coil_size = 1; // in bits

class Configuration
{
    public:
        Configuration(std::string path);
        ~Configuration();
        bool lookup_dbus_info(ModbusRegType regType, uint16_t addr, const ModbusDbusMapping **info);
        int get_reg_type_from_name(std::string name);
        bool isValid(const ModbusDbusMapping &info, int regType);
        int get_reg_number_by_bits(int length);
        uint16_t regTypeCnt[static_cast<int>(ModbusRegType::MODBUS_REG_TYPE_MAX)] = {0};

    private:
        std::string _path;
        reg_info _regs{};
};