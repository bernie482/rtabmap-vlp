/********************************************************
 * Arduino UNO
 * CDU PID Control
 * Read analog input A0 (flow sensor)
 * Control PWM output 3 (proportional valve)
 * http://brettbeauregard.com/blog/2011/04/improving-the-beginners-pid-introduction/

版本增修:
23/02/01 -> 可更改Kp、Ki、Kd
23/02/02 -> 可更改Setpoint, SampleTime
23/02/02 -> 可選PID控制or手動, 預設為PID控制
23/02/03 -> 可即時更改Kp、Ki、Kd, SampleTime(不影響其他功能)
23/02/04 -> 改掉更動設定&參數&顯示時，in/output鎖死問題
23/02/04 -> 增加顯示延遲計時

註: SampleTime仍需fine tunung
    待測pin 3的output值 
    Serial.read() => 改成讀取按建輸入
    問題print_to_monitor()有時會 < DISPLAY_TIME (i.g. (1)設定完Kd之後 (2)...)
    小數點讀取只能2位

 ********************************************************/
#define PIN_INPUT A0
#define PIN_OUTPUT 3
#define FLOW_MAX 60.0
#define N_MAX 1000
#define DISPLAY_TIME 3000

/* working variables */
float Setpoint, Process_value, Output_valve, error;
//int Ncount, Nmax = N_MAX;
unsigned long lastPV = 0.0;
unsigned long now;
unsigned long timeChange, lastTime;
unsigned long showTime, displayTimer;
float Iterm, dInput;
float aToV;
float SampleTime; // second
bool flag_setting, flag_setPID, flag_setST, flag_setSP, flag_setMode;
bool flag_setKp, flag_setKi, flag_setKd;
bool flag_display, flag_startDSP;
bool Automatic; // true: PID mode, false: manual mode
String readS;
char buffer[9]; // read Kp, Ki, Kd

/* PID tuning parameters */
double Kp, Ki, Kd;

//====================================================================
// Setup
//====================================================================
void setup()
{
  /* Turn on Serial port */
  Serial.begin(9600);

  /* variables Initialization */
  Setpoint = 30.0;
  Output_valve = 180; // default valve opening 180/255*5V
  SampleTime = 0.0;
  //Ncount = 0;
  lastPV = 0.0;
  lastTime = millis(); // ???第一次算會用到

  /* flag Initialization */
  flag_setting = 0;
  flag_setPID = 0;
  flag_setST = 0;
  flag_setSP = 0;
  flag_setMode = 0;
  flag_setKp = 0;
  flag_setKi = 0;
  flag_setKd = 0;
  flag_display = 0;
  flag_startDSP = 0;

  /* Control mode */
  Automatic = 1;

  /* PID tuning parameters */
  Kp = 1;
  Ki = 0.0;
  Kd = 0.0;

  Print_PID_Parameters();

}
//====================================================================
// Main Loop
//====================================================================
void loop()
{
  Print_Mode();

  Settings();

  now = millis();
  if ( Automatic==1 ) {
    timeChange = (now - lastTime);
    if (timeChange >= SampleTime*1000.0) {
      Compute();
      lastTime = now;
    }
  }else {
    if (flag_setMode!=1) {
      Manual_Mode();
    }
  }
  analogWrite(PIN_OUTPUT, Output_valve);

  Print_To_Monitor();
  
}
//====================================================================
// Settings
//====================================================================
void Settings () {
  //Serial.println("Settings：");
  if ((flag_setPID==1)||(flag_setST==1)||(flag_setSP)||(flag_setMode==1)) {
    flag_setting = 1;
  }

  if ((Serial.available()!=0)||(flag_setting==1)) {
    // read char 'R' to reset PID parameters...
    Read_Command();

    if ((readS[0]=='R')||(flag_setPID==1)) { /* reset Kp, Ki, Kd */
      Read_PID_Parameters();
    }
    else if ((readS[0]=='T')||(flag_setST==1)) { /* reset SampleTime */
      Read_SampleTime();
    }
    else if ((readS[0]=='S')||(flag_setSP==1)) { /* reset Setpoint */
      Read_Setpoint();
    }
    else if ((readS[0]=='M')||(flag_setMode==1)) { /* set control mode */
      Read_Control_Mode();
    }
    else {
      Serial.println("Input Error! Settings remain unchanged.");
      flag_setting = 0;
      //Print_PID_Parameters();

      flag_display = 1;
      //delay(DISPLAY_TIME);
    }
  }
}
//====================================================================
// Print function
//====================================================================
void Print_To_Monitor() {
  if (flag_display==1) {
    // show result to monitor for DISPLAY_TIME(s)
    if (flag_startDSP==0) {
      displayTimer = now; // start display timer
      flag_startDSP = 1;
    }else {
      showTime = now - displayTimer;
      //Serial.println(showTime);
      if (showTime > DISPLAY_TIME) {
        showTime = 0;
        flag_startDSP = 0;
        flag_display = 0;
      }
    }
  }else {
    /* 顯示延遲計時 DISPLAY_TIME */
    if (flag_startDSP==0) {
      displayTimer = now; // start display timer
      flag_startDSP = 1;
    }else {
    showTime = now - displayTimer;
      if (showTime > DISPLAY_TIME) {
        Serial.println("Print PV, CV...");
        showTime = 0;
        flag_startDSP = 0;
        flag_display = 0;
      }
    }

    //Serial.println("Print PV, CV...");
    //delay(1000);
  }
}

void Print_PID_Parameters() {
  Serial.println("Current PID parameters");
  Serial.println("Kp, Ki, Kd =");
  Serial.print(Kp);Serial.print(", ");
  Serial.print(Ki);Serial.print(", ");
  Serial.println(Kd);
  flag_display = 1;
  //delay(DISPLAY_TIME);
}

void Print_Mode() {
  if ( Automatic==1 ){
    //Serial.println("PID loop");
    //Serial.print("Loop time: ");
    //Serial.print(timeChange/1000.0);
    //Serial.println(" s");
  }else {
    //Serial.println("Manual loop");
  }
  //delay(DISPLAY_TIME); // for testing
}
//====================================================================
// Read function
//====================================================================
void Read_Command() {
  if (flag_setting==0){ // 1st time in read string, else read buffer
      readS = Serial.readString();  //read until timeout, Serial.setTimeout(ms)
      Serial.println("reading command...");
      flag_setting = 1;
  }
}

void Read_PID_Parameters() {
  if (flag_setKp==0){
    if(Serial.available()!=0) {
      Serial.readBytes(buffer,9);
      Kp = atof(buffer);
      flag_setKp = 1;
    }else {
      if (flag_setPID==0) {
        Serial.println("Input PID tuning paraeter：");
        Serial.println("Input Kp：");
        flag_setPID = 1; // reconsider
      }
      flag_setting = 1;
    }
  }
  if ((flag_setKp==1)&&(flag_setKi==0)) {
    if(Serial.available()!=0) {
      Serial.readBytes(buffer,9);
      Ki = atof(buffer);
      flag_setKi = 1;
    }else {
      if (flag_setPID==1) {
        Serial.println("Input Ki：");
        flag_setPID = 0;
      }
    }
  }
  if ((flag_setKi==1)&&(flag_setKd==0)) {
    if(Serial.available()!=0) {
      Serial.readBytes(buffer,9);
      Kd = atof(buffer);

      Print_PID_Parameters();

      flag_setKp = 0;
      flag_setKi = 0;
      flag_setPID = 0;
      flag_setting = 0;
      //delay(DISPLAY_TIME);
    }else {
      if (flag_setPID==0) {
        Serial.println("Input Kd：");
        flag_setPID = 1;
      }
    }
  }
  flag_display = 1;
}

void Read_SampleTime() {
  if(Serial.available()!=0) {
    Serial.readBytes(buffer,9);
    SampleTime = atof(buffer);

    Serial.print("New SampleTime： ");
    Serial.print(SampleTime);
    Serial.println(" s");

    flag_setST = 0;
    flag_setting = 0;
    flag_display = 1;
    //delay(DISPLAY_TIME);
  }else {
    if (flag_setST==0) {
      Serial.println("Input SampleTime (second)：");
      flag_setST = 1;
    }
    flag_display = 1;
    //delay(DISPLAY_TIME);
  }
}

void Read_Setpoint(){
  if(Serial.available()!=0) {
    Serial.readBytes(buffer,9);
    Setpoint = atof(buffer);

    Serial.print("New Setpoint： ");
    Serial.print(Setpoint);
    Serial.println(" LPM");
    
    flag_setSP = 0;
    flag_setting = 0;
    flag_display = 1;
    //delay(DISPLAY_TIME);
  }else {
    if (flag_setSP == 0) {
      Serial.println("Input Setpoint (LPM)：");
      flag_setSP = 1;
    }
    flag_display = 1;
    //delay(DISPLAY_TIME);
  }
}

void Read_Control_Mode(){
  if(Serial.available()!=0) {
    Serial.readBytes(buffer,9);
    if ( buffer[0]=='1' ){
        Serial.println("PID mode.");
        Print_PID_Parameters();
        Automatic = 1;
        flag_setMode = 0;
      }
      else if ( buffer[0]=='2' ){
        Serial.println("Manual mode.");
        Manual_Mode();
        Automatic = 0;
        flag_setMode = 0;
      }
      else {
        Serial.println("Input mode error.");
        flag_setMode = 1;
        flag_display = 1;
        //delay(DISPLAY_TIME);
      }

    //flag_setMode = 0;
    flag_setting = 0;
    flag_display = 1;
  }else {
    if (flag_setMode==0) {
      Serial.println("Please choose your control mode.");
      Serial.println("PID mode = 1, Manual mode = 2");
      flag_setMode = 1;
    }
    flag_display = 1;
    //delay(DISPLAY_TIME);
  }
}
//====================================================================
// Manual control //unsolved: once enter manual mode, control loop lockdown
//====================================================================
void Manual_Mode() { 
  char setManual[9];
  Serial.println("Please enter your control value 0~255. (0 = reset)");
  while (Serial.available() == 0) {}     //wait for data available
  Serial.readBytes(setManual,9); //0~255
  Output_valve = atof(setManual);

  /* Unit conversion *
  Serial.print("New Output value： ");
  Serial.print(Output_valve/255.0*5);
  Serial.println(" V"); */

  if (Output_valve!=0) { 
    Serial.println(Output_valve);
  }
  else {
    flag_setting = 1;
    readS[0]='M';
  }
  flag_display = 1;
  //delay(DISPLAY_TIME);
}
//====================================================================
// PID control
//====================================================================
int Compute() {
  /* module testing */
  //Serial.println("compute");
  Output_valve = 0;

  //Process_value = (float)analogRead(PIN_INPUT)/1023.0*FLOW_MAX;
  //flow sensor input 4~20 mA => 0.96~5V (~247 ohm)
  
  aToV = (float)analogRead(PIN_INPUT)/1023.0*5.0;

  if (aToV<=0.96) {Process_value = 0.0;}
  else {
    Process_value = (FLOW_MAX/(5.0-0.96))*(aToV-0.96);
  }

  //Serial.println(aToV);
  //Serial.println(Process_value);

  /*Compute all the working error variables*/
  error = Setpoint - Process_value;
  dInput = (Process_value - lastPV);

  //compute P-term
  Output_valve += Kp * error;

  //compute I-term
  Iterm += (Ki * error)*SampleTime;
  Output_valve += Iterm;

  //compute D-term
  Output_valve -= Kd * dInput;

  //Output signal limit 0~255(arduino)
  if(Output_valve > 255) Output_valve = 255;
  else if(Output_valve < 0) Output_valve = 0;
#define DAC_SCALE (5000 / 255)
  Output_valve *= DAC_SCALE;

  //Serial.println(Output_valve);
  //delay(2000);

  /*Remember some variables for next time*/                                                                          
  lastPV = Process_value;
}
