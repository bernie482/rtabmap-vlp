#pragma once
#define LED_OFF		(0x0)
#define LED_ON		(0x1)
#define LED_FLASH	(0x2)

struct system_board_info{
	char          model[16];
	char          firmware_ver[16];
	char          fan_wall_firmware_ver[16];
	char          lib_ver[16];
	double        temperature;
	int           power_consumption;
};

struct led_status{
	unsigned char led1:2;
	unsigned char led2:2;
	unsigned char led3:2;
	unsigned char led4:2;
	unsigned char led5:2;
	unsigned char led6:2;
	unsigned char led7:2;
	unsigned char reserve:2;
};

struct pump_device{
	unsigned char lv1;
	unsigned char lv2;
	unsigned char lv3;
	unsigned char lv4;
	int           speed[4];
	char          status[4];
};

struct fan_device{
	unsigned char lv1_4;
	unsigned char lv5_8;
	unsigned char lv9_12;
	int           speed[12];
	char          status[12];
};

struct boxer_pump_device{
	unsigned char lv;
	int           speed;
	char          status;
};

struct input_gpio{
	unsigned char button:1;
	unsigned char lv1:1;
	unsigned char lv2:1;
	unsigned char lv3:1;
	unsigned char water_detect1:1;
	unsigned char water_detect2:1;
	unsigned char reserve:2;
};

struct adc_device{
	int           pressure1;
	int           pressure2;
	int           pressure3;
	double        flow1;         // B18
	double        flow2;         // B21
	double        flow3;         // Noused
	double        temperature1;  // B19
	double        temperature2;  // B22
	double        temperature3;  // B23
	double        temperature4;  // B24
};

struct pt100_device{
	double        temperature;   // B25 & B26
};

struct dac_device{
	int mVol;
};

struct psu_device{
	int totalWatt;
	int vol;
	int cur;
};

struct fan_wall_dev_ctrl{
	unsigned char lv1_2;
	unsigned char lv3_5;
};

struct fan_wall_dev_status{
	int           speed[5];
	int           air_flow[5];
	char          status[5];
	double        pt100;
	unsigned char water_detect:1;
	unsigned char reserve:7;
};

struct system_status{
	unsigned int pump1_speed:1;
	unsigned int pump2_speed:1;
	unsigned int pump3_speed:1;
	unsigned int pump4_speed:1;
	unsigned int fan1_speed:1;
	unsigned int fan2_speed:1;
	unsigned int fan3_speed:1;
	unsigned int fan4_speed:1;
	unsigned int fan5_speed:1;
	unsigned int fan6_speed:1;
	unsigned int fan7_speed:1;
	unsigned int fan8_speed:1;
	unsigned int fan9_speed:1;
	unsigned int fan10_speed:1;
	unsigned int fan11_speed:1;
	unsigned int boxer_pump_speed:1;
	unsigned int button:1;
	unsigned int lv1:1;
	unsigned int lv2:1;
	unsigned int lv3:1;
	unsigned int water_detect1:1;
	unsigned int water_detect2:1;
	unsigned int pressure1:1;
	unsigned int pressure2:1;
	unsigned int pressure3:1;
	unsigned int flow1:1;
	unsigned int flow2:1;
	unsigned int flow3:1;
	unsigned int temperature1:1;
	unsigned int temperature2:1;
	unsigned int temperature3:1;
	unsigned int temperature4:1;
	unsigned int pt100_temperature:1;
	unsigned int psu1_totalWatt:1;
	unsigned int psu1_vol:1;
	unsigned int psu1_cur:1;
	unsigned int psu2_totalWatt:1;
	unsigned int psu2_vol:1;
	unsigned int psu2_cur:1;
	unsigned int pcb_temperature:1;
	unsigned int power_consumption:1;
#if 0
	unsigned int fan_wall_fan1_speed:1;
	unsigned int fan_wall_fan2_speed:1;
	unsigned int fan_wall_fan3_speed:1;
	unsigned int fan_wall_fan4_speed:1;
	unsigned int fan_wall_fan5_speed:1;
	unsigned int fan_wall_air_flow1:1;
	unsigned int fan_wall_air_flow2:1;
	unsigned int fan_wall_air_flow3:1;
	unsigned int fan_wall_air_flow4:1;
	unsigned int fan_wall_air_flow5:1;
	unsigned int fan_wall_pt100:1;
	unsigned int fan_wall_water_detect:1;
	unsigned int reserve:11;
#else
	unsigned int reserve:23;
#endif
};

int ioHalInit(void);
int systemBoardInfoGet(int handler,struct system_board_info   *info);
int getSystemStatusChg(int handler,struct system_status       *status);
int ledStatusGet(      int handler,struct led_status          *status);
int ledStatusSet(      int handler,struct led_status          *status);
int pumpDeviceSet(     int handler,struct pump_device         *device);
int pumpDeviceGet(     int handler,struct pump_device         *device);
int fanDeviceSet(      int handler,struct fan_device          *device);
int fanDeviceGet(      int handler,struct fan_device          *device);
int boxerPumpDeviceSet(int handler,struct boxer_pump_device   *device);
int boxerPumpDeviceGet(int handler,struct boxer_pump_device   *device);
int inputGpioGet(      int handler,struct input_gpio          *status);
int adcDeviceGet(      int handler,struct adc_device          *status);
int dacDeviceSet(      int handler,struct dac_device          *status);
int dacDeviceGet(      int handler,struct dac_device          *status);
int pt100DeviceGet(    int handler,struct pt100_device        *status);
int psu1DeviceGet(     int handler,struct psu_device          *device);
int psu2DeviceGet(     int handler,struct psu_device          *device);
int fanWallDeviceSet(  int handler,struct fan_wall_dev_ctrl   *device);
int fanWallDeviceGet(  int handler,struct fan_wall_dev_status *device);
