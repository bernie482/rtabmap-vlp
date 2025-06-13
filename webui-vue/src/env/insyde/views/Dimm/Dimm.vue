<template>
  <b-container fluid="x1">
    <page-title />
    <insyde-unavailable v-if="unavailable" v-show="!loading" />
    <b-row v-if="!unavailable" class="align-items-end">
      <b-col sm="6" md="5" xl="4">
        <search
          @change-search="onChangeSearchInput"
          @clear-search="onClearSearchInput"
        />
      </b-col>
      <b-col sm="6" md="3" xl="2">
        <table-cell-count
          :filtered-items-count="filteredRows"
          :total-number-of-cells="dimms.length"
        ></table-cell-count>
      </b-col>
    </b-row>
    <b-table
      v-if="!unavailable"
      sort-icon-left
      no-sort-reset
      hover
      responsive="md"
      show-empty
      :items="dimms"
      :fields="fields"
      :filter="searchFilter"
      :empty-text="$t('global.table.emptyMessage')"
      :empty-filtered-text="$t('global.table.emptySearchMessage')"
      @filtered="onFiltered"
    >
      <!-- Expand chevron icon -->
      <template #cell(expandRow)="row">
        <b-button
          variant="link"
          data-test-id="hardwareStatus-button-expandDimms"
          :title="expandRowLabel"
          class="btn-icon-only"
          @click="toggleRowDetails(row)"
        >
          <icon-chevron />
          <span class="sr-only">{{ expandRowLabel }}</span>
        </b-button>
      </template>

      <!-- Health -->
      <template #cell(health)="{ value }">
        <status-icon :status="statusIcon(value)" />
        {{ value }}
      </template>

      <template #row-details="{ item }">
        <!-- IdentifyInfo -->
        <!-- <p>{{ item }}</p> -->
        <b-container v-if="item.identifyinfo !== null" fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <caption>
                {{
                  $t('pageDimm.table.detail.identifyinfo.title')
                }}
              </caption>
            </b-col>
          </b-row>
          <b-row>
            <b-col>{{
              $t('pageDimm.table.detail.identifyinfo.chipsetrevisionid')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.identifyinfo.ChipsetRevisionID)
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.identifyinfo.memorymodeenabled')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.identifyinfo.MemoryModeEnabled)
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.identifyinfo.manufacturerid')
            }}</b-col>
            <b-col>{{ dataFormatter(item.identifyinfo.ManufacturerID) }}</b-col>
          </b-row>
          <b-row>
            <b-col>{{
              $t('pageDimm.table.detail.identifyinfo.appdirectmodeenabled')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.identifyinfo.AppDirectModeEnabled)
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.identifyinfo.interfaceformatcode')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.identifyinfo.InterfaceFormatCode)
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.identifyinfo.packagesparingcapable')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.identifyinfo.PackageSparingCapable)
            }}</b-col>
          </b-row>
          <b-row>
            <b-col>{{
              $t('pageDimm.table.detail.identifyinfo.manufacturingdate')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.identifyinfo.ManufacturingDate)
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.identifyinfo.encryptionenabled')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.identifyinfo.EncryptionEnabled)
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.identifyinfo.manufacturinglocation')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.identifyinfo.ManufacturingLocation)
            }}</b-col>
          </b-row>
          <!--<b-row v-for="i of items" :key="i.id">
            <b-col>{{ 'id:' }}</b-col>
            <b-col>{{ i.id }}</b-col>
            <b-col>{{ 'first name:' }}</b-col>
            <b-col>{{ i.firstName }}</b-col>
          </b-row>-->
          <br />
        </b-container>
        <!-- Characteristics -->
        <b-container v-if="item.characteristics" fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <caption>
                {{
                  $t('pageDimm.table.detail.characteristics.title')
                }}
              </caption>
            </b-col>
          </b-row>
          <b-row>
            <b-col>{{
              $t(
                'pageDimm.table.detail.characteristics.controllertemperatureshutdownthreshold'
              )
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.characteristics.ControllerTemperatureShutdownThreshold
              )
            }}</b-col>
            <b-col>{{
              $t(
                'pageDimm.table.detail.characteristics.optanemediatemperatureshutdownthreshold'
              )
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.characteristics.OptaneMediaTemperatureShutdownThreshold
              )
            }}</b-col>
            <b-col>{{
              $t(
                'pageDimm.table.detail.characteristics.controllerthrottlingstartthreshold'
              )
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.characteristics.ControllerThrottlingStartThreshold
              )
            }}</b-col>
          </b-row>
          <b-row>
            <b-col>{{
              $t(
                'pageDimm.table.detail.characteristics.optanemediathrottlingstartthreshold'
              )
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.characteristics.OptaneMediaThrottlingStartThreshold
              )
            }}</b-col>
            <b-col>{{
              $t(
                'pageDimm.table.detail.characteristics.controllerthrottlingstartthreshold'
              )
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.characteristics.ControllerThrottlingStopThreshold
              )
            }}</b-col>
            <b-col>{{
              $t(
                'pageDimm.table.detail.characteristics.optanemediathrottlingstopthreshold'
              )
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.characteristics.OptaneMediaThrottlingStopThreshold
              )
            }}</b-col>
          </b-row>
        </b-container>
        <!-- Health -->
        <b-container v-if="Object.keys(item.metricsinfo).length > 0" fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <!-- <p>{{ item }}</p> -->
              <caption>
                {{
                  $t('pageDimm.table.detail.health.title')
                }}
              </caption>
            </b-col>
          </b-row>
          <b-row>
            <b-col>{{
              $t('pageDimm.table.detail.health.lastshutdownsuccess')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.metricsinfo.HealthData.LastShutdownSuccess)
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.health.remainingspareblockpercentage')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.HealthData.RemainingSpareBlockPercentage
              )
            }}</b-col>
          </b-row>
        </b-container>
        <!-- Intel-RackScale -->
        <b-container v-if="Object.keys(item.metricsinfo).length > 0" fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <caption>
                {{
                  $t('pageDimm.table.detail.intelrackscale.title')
                }}
              </caption>
            </b-col>
          </b-row>
          <b-row>
            <b-col>{{
              $t('pageDimm.table.detail.intelrackscale.temperaturecelsius')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.Intel_RackScale.TemperatureCelsius
              )
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.intelrackscale.powercycles')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.Intel_RackScale.LifeTime.PowerCycles
              )
            }}</b-col>
            <b-col>{{
              $t(
                'pageDimm.table.detail.intelrackscale.controllertemperaturecelsius'
              )
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.Intel_RackScale
                  .ControllerTemperatureCelsius
              )
            }}</b-col>
          </b-row>
          <b-row>
            <b-col>{{
              $t('pageDimm.table.detail.intelrackscale.powerontimeseconds')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.Intel_RackScale.LifeTime.PowerOnTimeSeconds
              )
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.intelrackscale.health')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.metricsinfo.Oem.Intel_RackScale.Health)
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.intelrackscale.uptimeseconds')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.Intel_RackScale.CurrentPeriod.UptimeSeconds
              )
            }}</b-col>
          </b-row>
        </b-container>
        <!-- External -->
        <b-container v-if="Object.keys(item.metricsinfo).length > 0" fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <caption>
                <b>
                  {{ $t('pageDimm.table.detail.external.title') }}
                </b>
              </caption>
            </b-col>
          </b-row>
          <b-row
            ><!-- row 1 -->
            <b-col>{{
              $t('pageDimm.table.detail.external.PercentageRemainingTrip')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                  .PercentageRemainingTrip
              )
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.external.LatchedDirtyShutdownCount')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                  .LatchedDirtyShutdownCount
              )
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.external.MaxControllerTemperature')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                  .MaxControllerTemperature
              )
            }}</b-col>
          </b-row>
          <b-row
            ><!-- row 2 -->
            <b-col>{{
              $t('pageDimm.table.detail.external.MediaTemperatureTrip')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                  .MediaTemperatureTrip
              )
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.external.UnlatchedDirtyShutdownCount')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                  .UnlatchedDirtyShutdownCount
              )
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.external.AITDRAMEnabled')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth.AITDRAMEnabled
              )
            }}</b-col>
          </b-row>
          <b-row
            ><!-- row 3 -->
            <b-col>{{
              $t('pageDimm.table.detail.external.ControllerTemperatureTrip')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                  .ControllerTemperatureTrip
              )
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.external.MaxMediaTemperature')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                  .MaxMediaTemperature
              )
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.external.LastShutdownTime')
            }}</b-col>
            <b-col>{{
              dataFormatter(
                item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth.LastShutdownTime
              )
            }}</b-col>
          </b-row>
          <b-row>
            <b-col>{{
              $t(
                'pageDimm.table.detail.external.LatchedLastShutdownStatusDetails'
              )
            }}</b-col>
            <b-col>
              <div class="div-button">
                {{
                  dataFormatter(
                    item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                      .LatchedLastShutdownStatusDetails[0]
                  )
                }}
              </div>
              <div class="div-button">
                {{
                  dataFormatter(
                    item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                      .LatchedLastShutdownStatusDetails[1]
                  )
                }}
              </div>
              <div class="div-button">
                {{
                  dataFormatter(
                    item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                      .LatchedLastShutdownStatusDetails[2]
                  )
                }}
              </div>
              <div class="div-button">
                {{
                  dataFormatter(
                    item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                      .LatchedLastShutdownStatusDetails[3]
                  )
                }}
              </div>
              <div class="div-button">
                {{
                  dataFormatter(
                    item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                      .LatchedLastShutdownStatusDetails[4]
                  )
                }}
              </div>
            </b-col>
            <b-col>{{
              $t(
                'pageDimm.table.detail.external.UnlatchedLastShutdownStatusDetails'
              )
            }}</b-col>
            <b-col>
              <div class="div-button">
                {{
                  dataFormatter(
                    item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                      .UnlatchedLastShutdownStatusDetails[0]
                  )
                }}
              </div>
              <div class="div-button">
                {{
                  dataFormatter(
                    item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                      .UnlatchedLastShutdownStatusDetails[1]
                  )
                }}
              </div>
              <div class="div-button">
                {{
                  dataFormatter(
                    item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                      .UnlatchedLastShutdownStatusDetails[2]
                  )
                }}
              </div>
              <div class="div-button">
                {{
                  dataFormatter(
                    item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                      .UnlatchedLastShutdownStatusDetails[3]
                  )
                }}
              </div>
              <div class="div-button">
                {{
                  dataFormatter(
                    item.metricsinfo.Oem.InsydeDCPMM.SmartAndHealth
                      .UnlatchedLastShutdownStatusDetails[4]
                  )
                }}
              </div>
            </b-col>
          </b-row>
        </b-container>
        <!-- SecurityCapabilities -->
        <b-container v-if="Object.keys(item.metricsinfo).length > 0" fluid>
          <b-row>
            <b-col sm="6" xl="4">
              <caption>
                <b>
                  {{ $t('pageDimm.table.detail.SecurityCapabilities.title') }}
                </b>
              </caption>
            </b-col>
          </b-row>
          <b-row>
            <b-col>{{
              $t('pageDimm.table.detail.SecurityCapabilities.PassphraseCapable')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.securityCapabilities.PassphraseCapable)
            }}</b-col>
            <b-col>{{
              $t('pageDimm.table.detail.SecurityCapabilities.SecurityStates')
            }}</b-col>
            <b-col>{{
              dataFormatter(item.securityCapabilities.SecurityStates)
            }}</b-col>
          </b-row>
        </b-container>
        <!-- SecurityAction -->
        <br />
        <b-container v-if="Object.keys(item.securityOptions).length > 0" fluid>
          <div>
            <!-- <span>{{ item.securityOptions }}</span> -->
            <div id="radio_action_Dimm2_div">
              <div id="radio_action_Dimm2_div_container" class="container-flex">
                <div id="radio_action_Dimm2" class="radio-table">
                  <div class="radio-tr">
                    <div
                      v-if="
                        item.securityOptions.find(function (
                          item,
                          index,
                          array
                        ) {
                          return item[0] == 'Set Master Passphrase';
                        })
                      "
                      class="radio-box-container"
                    >
                      <input
                        id="radio_action_Dimm2_0"
                        v-model="radioCheck"
                        type="radio"
                        name="radio_action_Dimm2_Value"
                        value="0"
                        @change="onChange($event)"
                      />
                      {{
                        $t(
                          'pageDimm.table.detail.SecurityAction.SetMasterPassphraseBtn'
                        )
                      }}
                    </div>
                    <div
                      v-if="
                        item.securityOptions.find(function (
                          item,
                          index,
                          array
                        ) {
                          return item[0] == 'Set Passphrase';
                        })
                      "
                      class="radio-box-container"
                    >
                      <input
                        id="radio_action_Dimm2_1"
                        v-model="radioCheck"
                        type="radio"
                        name="radio_action_Dimm2_Value"
                        value="1"
                        @change="onChange($event)"
                      />
                      {{
                        $t(
                          'pageDimm.table.detail.SecurityAction.SetPassphraseBtn'
                        )
                      }}
                    </div>
                    <div
                      v-if="
                        item.securityOptions.find(function (
                          item,
                          index,
                          array
                        ) {
                          return item[0] == 'Secure Erase';
                        })
                      "
                      class="radio-box-container"
                    >
                      <input
                        id="radio_action_Dimm2_2"
                        v-model="radioCheck"
                        type="radio"
                        name="radio_action_Dimm2_Value"
                        value="2"
                        @change="onChange($event)"
                      />
                      {{
                        $t(
                          'pageDimm.table.detail.SecurityAction.SecureEraseBtn'
                        )
                      }}
                    </div>
                    <div
                      v-if="
                        item.securityOptions.find(function (
                          item,
                          index,
                          array
                        ) {
                          return item[0] == 'Disable Passphrase';
                        })
                      "
                      class="radio-box-container"
                    >
                      <input
                        id="radio_action_Dimm2_2"
                        v-model="radioCheck"
                        type="radio"
                        name="radio_action_Dimm2_Value"
                        value="3"
                        @change="onChange($event)"
                      />
                      {{
                        $t(
                          'pageDimm.table.detail.SecurityAction.DisablePassphraseBtn'
                        )
                      }}
                    </div>
                    <div
                      v-if="
                        item.securityOptions.find(function (
                          item,
                          index,
                          array
                        ) {
                          return item[0] == 'Unlock Unit';
                        })
                      "
                      class="radio-box-container"
                    >
                      <input
                        id="radio_action_Dimm2_2"
                        v-model="radioCheck"
                        type="radio"
                        name="radio_action_Dimm2_Value"
                        value="4"
                        @change="onChange($event)"
                      />
                      {{
                        $t('pageDimm.table.detail.SecurityAction.UnlockUnitBtn')
                      }}
                    </div>
                    <div
                      v-if="
                        item.securityOptions.find(function (
                          item,
                          index,
                          array
                        ) {
                          return item[0] == 'Freeze Lock';
                        })
                      "
                      class="radio-box-container"
                    >
                      <input
                        id="radio_action_Dimm2_2"
                        v-model="radioCheck"
                        type="radio"
                        name="radio_action_Dimm2_Value"
                        value="5"
                        @change="onChange($event)"
                      />
                      {{
                        $t('pageDimm.table.detail.SecurityAction.FreezeLockBtn')
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id="content_Dimm2_div">
              <b-form id="form-user" novalidate>
                <div
                  id="content_Dimm2_div_container"
                  class="container-flex vertical"
                >
                  <div
                    v-show="
                      radioCheck == 2 ||
                      radioCheck == 3 ||
                      radioCheck == 4 ||
                      radioCheck == 5
                    "
                    id="check_pass_Dimm2_div_container"
                    class="container-flex"
                  >
                    <div class="password-container">
                      <label class="title">
                        {{
                          $t(
                            'pageDimm.table.detail.SecurityAction.checkpassphrase-lb'
                          )
                        }}
                      </label>
                      <!-- <b-form-text id="password-help-block">
                        {{
                          $t('pageDimm.table.passwordMustBeBetween', {
                            min: 3,
                            max: 16,
                          })
                        }}
                      </b-form-text> -->
                      <input-password-toggle>
                        <b-form-input
                          id="check_passphrase_password"
                          v-model="BPS.CheckPassphrase.password"
                          :state="
                            getValidationState($v.BPS.CheckPassphrase.password)
                          "
                          type="password"
                          data-test-id="login-input-password"
                          aria-describedby="password-help-block"
                          class="form-control-with-button"
                          @input="$v.BPS.CheckPassphrase.password.$touch()"
                        >
                        </b-form-input>
                        <b-form-invalid-feedback role="alert">
                          <template
                            v-if="!$v.BPS.CheckPassphrase.password.required"
                          >
                            {{ $t('global.form.fieldRequired') }}
                          </template>
                          <template
                            v-if="
                              !$v.BPS.CheckPassphrase.password.minLength ||
                              !$v.BPS.CheckPassphrase.password.maxLength
                            "
                          >
                            {{
                              $t('pageDimm.table.passwordMustBeBetween', {
                                min: 3,
                                max: 16,
                              })
                            }}
                          </template>
                          <template
                            v-else-if="!$v.BPS.CheckPassphrase.password.pattern"
                          >
                            {{ $t('global.form.invalidFormat') }}
                          </template>
                        </b-form-invalid-feedback>
                      </input-password-toggle>
                    </div>
                  </div>
                  <div
                    id="set_pass_Dimm2_div_container"
                    class="container-flex vertical"
                  >
                    <div
                      v-show="radioCheck == 0 || radioCheck == 1"
                      id="curr_pass_Dimm2_div_container"
                      class="container-flex"
                    >
                      <label class="title">{{
                        $t(
                          'pageDimm.table.detail.SecurityAction.current-passphrase-lb'
                        )
                      }}</label>
                      <div class="password-container">
                        <input-password-toggle>
                          <b-form-input
                            id="current_passphrase_password"
                            v-model="BPS.Passphrase.current_password"
                            aria-describedby="login-error-alert password-required"
                            :state="
                              getValidationState(
                                $v.BPS.Passphrase.current_password
                              )
                            "
                            type="password"
                            data-test-id="login-input-password"
                            class="form-control-with-button"
                            @input="$v.BPS.Passphrase.current_password.$touch()"
                          >
                          </b-form-input>
                          <b-form-invalid-feedback role="alert">
                            <template
                              v-if="
                                !$v.BPS.Passphrase.current_password.required
                              "
                            >
                              {{ $t('global.form.fieldRequired') }}
                            </template>
                            <template
                              v-if="
                                !$v.BPS.Passphrase.current_password.minLength ||
                                !$v.BPS.Passphrase.current_password.maxLength
                              "
                            >
                              {{
                                $t('pageDimm.table.passwordMustBeBetween', {
                                  min: 3,
                                  max: 16,
                                })
                              }}
                            </template>
                            <template
                              v-else-if="
                                !$v.BPS.Passphrase.current_password.pattern
                              "
                            >
                              {{ $t('global.form.invalidFormat') }}
                            </template>
                          </b-form-invalid-feedback>
                        </input-password-toggle>
                      </div>
                    </div>
                    <div
                      v-show="radioCheck == 0 || radioCheck == 1"
                      id="new_pass_Dimm2_div_container"
                      class="container-flex"
                    >
                      <label class="title">{{
                        $t(
                          'pageDimm.table.detail.SecurityAction.new-passphrase-lb'
                        )
                      }}</label>
                      <div class="password-container">
                        <input-password-toggle>
                          <b-form-input
                            id="new_passphrase_password"
                            v-model="BPS.Passphrase.new_password"
                            aria-describedby="login-error-alert password-required"
                            :state="
                              getValidationState($v.BPS.Passphrase.new_password)
                            "
                            type="password"
                            data-test-id="login-input-password"
                            class="form-control-with-button"
                            @input="$v.BPS.Passphrase.new_password.$touch()"
                          >
                          </b-form-input>
                          <b-form-invalid-feedback role="alert">
                            <template
                              v-if="!$v.BPS.Passphrase.new_password.required"
                            >
                              {{ $t('global.form.fieldRequired') }}
                            </template>
                            <template
                              v-if="
                                !$v.BPS.Passphrase.new_password.minLength ||
                                !$v.BPS.Passphrase.new_password.maxLength
                              "
                            >
                              {{
                                $t('pageDimm.table.passwordMustBeBetween', {
                                  min: 3,
                                  max: 16,
                                })
                              }}
                            </template>
                            <template
                              v-else-if="
                                !$v.BPS.Passphrase.new_password.pattern
                              "
                            >
                              {{ $t('global.form.invalidFormat') }}
                            </template>
                          </b-form-invalid-feedback>
                        </input-password-toggle>
                      </div>
                    </div>
                    <div
                      v-show="radioCheck == 0 || radioCheck == 1"
                      id="confirm_pass_Dimm2_div_container"
                      class="container-flex"
                    >
                      <label class="title">{{
                        $t(
                          'pageDimm.table.detail.SecurityAction.confirm-passphrase-lb'
                        )
                      }}</label>
                      <div class="password-container">
                        <input-password-toggle>
                          <b-form-input
                            id="confirm_passphrase_password"
                            v-model="BPS.Passphrase.confirm_password"
                            aria-describedby="login-error-alert password-required"
                            :state="
                              getValidationState(
                                $v.BPS.Passphrase.confirm_password
                              )
                            "
                            type="password"
                            data-test-id="login-input-password"
                            class="form-control-with-button"
                            @input="$v.BPS.Passphrase.confirm_password.$touch()"
                          >
                          </b-form-input>
                          <b-form-invalid-feedback role="alert">
                            <template
                              v-if="
                                !$v.BPS.Passphrase.confirm_password.required
                              "
                            >
                              {{ $t('global.form.fieldRequired') }}
                            </template>
                            <template
                              v-else-if="
                                !$v.BPS.Passphrase.confirm_password
                                  .sameAsPassword
                              "
                            >
                              {{
                                $t(
                                  'pageUserManagement.modal.passwordsDoNotMatch'
                                )
                              }}
                            </template>
                          </b-form-invalid-feedback>
                        </input-password-toggle>
                      </div>
                    </div>
                  </div>
                </div>
              </b-form>
            </div>
            <div id="save_button_Dimm2_div">
              <div
                id="save_button_Dimm2_div_container"
                class="container-grid"
                style="
                  grid-template-rows: 1fr;
                  grid-template-columns: 500px 80px;
                  grid-template-areas: none;
                "
              >
                <div id="space_div_container" class="container-flex"></div>
                <b-button
                  form="form-user"
                  data-test-id="users-button-submit"
                  type="submit"
                  class="button"
                  @click="onHandleSecurityActionBtn(item.securityOptions)"
                >
                  {{ $t('global.action.save') }}
                </b-button>
              </div>
            </div>
          </div>
        </b-container>
      </template>
    </b-table>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

import IconChevron from '@carbon/icons-vue/es/chevron--down/20';

import StatusIcon from '@/components/Global/StatusIcon';
import TableCellCount from '@/components/Global/TableCellCount';

import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import Search from '@/components/Global/Search';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
import DimmTableRowExpandMixin, {
  expandRowLabel,
} from '@/env/insyde/components/Mixins/DimmTableRowExpandMixin';
import {
  required,
  maxLength,
  minLength,
  sameAs,
  helpers,
  requiredIf,
} from 'vuelidate/lib/validators';
import InputPasswordToggle from '@/components/Global/InputPasswordToggle';

export default {
  name: 'Dimm',
  components: {
    PageTitle,
    IconChevron,
    StatusIcon,
    Search,
    TableCellCount,
    InputPasswordToggle,
  },
  mixins: [DimmTableRowExpandMixin, DataFormatterMixin, SearchFilterMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      fields: [
        {
          key: 'expandRow',
          label: '',
          tdClass: 'table-row-expand',
          sortable: false,
        },
        {
          key: 'slotnumber',
          label: this.$t('pageDimm.table.slotnumber'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'size',
          label: this.$t('pageDimm.table.size'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'type',
          label: this.$t('pageDimm.table.type'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'speed',
          label: this.$t('pageDimm.table.speed'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'voltage',
          label: this.$t('pageDimm.table.voltage'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'manufacturer',
          label: this.$t('pageDimm.table.manufacturer'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'assettag',
          label: this.$t('pageDimm.table.assettag'),
          formatter: this.dataFormatter,
          sortable: true,
          tdClass: 'text-nowrap',
        },
        {
          key: 'serialNumber',
          label: this.$t('pageDimm.table.serialNumber'),
          formatter: this.dataFormatter,
          sortable: true,
        },
        {
          key: 'partNumber',
          label: this.$t('pageDimm.table.partNumber'),
          formatter: this.dataFormatter,
          sortable: true,
        },
      ],
      //TODO: how to make radioCheck get default option value
      radioCheck: 0,
      radioCheckPassphrase: 'passwd',
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      expandRowLabel: expandRowLabel,
      BPS: {
        Passphrase: {
          current_password: '',
          new_password: '',
          confirm_password: '',
        },
        CheckPassphrase: {
          password: '',
          passwordConfirmation: '',
        },
      },
    };
  },
  computed: {
    unavailable() {
      return this.dimms.length === 0;
    },
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.dimms.length;
    },
    dimms() {
      return this.$store.getters['insydememorystore/dimmsmetrics'];
    },
  },
  created() {
    this.startLoader();

    this.$store.dispatch('insydememorystore/getDimmMetrics').finally(() => {
      this.endLoader();
    });
  },
  validations() {
    return {
      BPS: {
        Passphrase: {
          current_password: {
            required: requiredIf(function () {
              return this.requirePassword();
            }),
            minLength: minLength(3), //minLength(this.passwordRequirements.minLength),
            maxLength: maxLength(16), //maxLength(this.passwordRequirements.maxLength),
            //TODO: check pattern for password
            pattern: helpers.regex('pattern', /^([a-zA-Z_][a-zA-Z0-9_]*)/),
          },
          new_password: {
            required: requiredIf(function () {
              return this.requirePassword();
            }),
            minLength: minLength(3), //minLength(this.passwordRequirements.minLength),
            maxLength: maxLength(16), //maxLength(this.passwordRequirements.maxLength),
            //TODO: check pattern for password
            pattern: helpers.regex('pattern', /^([a-zA-Z_][a-zA-Z0-9_]*)/),
          },
          confirm_password: {
            required: requiredIf(function () {
              return this.requirePassword();
            }),
            sameAsPassword: sameAs('new_password'),
          },
        },
        SetMasterPassphrase: {
          password: {
            required,
          },
        },
        CheckPassphrase: {
          password: {
            required: requiredIf(function () {
              return this.requirePassword();
            }),
            minLength: minLength(3), //minLength(this.passwordRequirements.minLength),
            maxLength: maxLength(16), //maxLength(this.passwordRequirements.maxLength),
            //TODO: check pattern for password
            pattern: helpers.regex('pattern', /^([a-zA-Z_][a-zA-Z0-9_]*)/),
          },
        },
        password: {
          required: requiredIf(function () {
            return this.requirePassword();
          }),
          minLength: 3, //minLength(this.passwordRequirements.minLength),
          maxLength: 16, //maxLength(this.passwordRequirements.maxLength),
        },
        passwordConfirmation: {
          required: requiredIf(function () {
            return this.requirePassword();
          }),
          sameAsPassword: sameAs('password'),
        },
      },
    };
  },
  methods: {
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    onChange(event) {
      var data = event.target.value;
      console.log(data);
    },
    onPasswdChange(event) {
      var data = event.target.value;
      console.log(data);
    },
    toggleVisibility() {
      const firstChild = this.$children[0];
      const inputEl = firstChild ? firstChild.$el : null;

      this.isVisible = !this.isVisible;

      if (inputEl && inputEl.nodeName === 'INPUT') {
        inputEl.type = this.isVisible ? 'text' : 'password';
      }

      this.isVisible
        ? (this.togglePasswordLabel = this.$t('global.ariaLabel.hidePassword'))
        : (this.togglePasswordLabel = this.$t('global.ariaLabel.showPassword'));
    },
    onHandleSecurityActionBtn: function (data) {
      let index = data.indexOf(
        data.find((arr) => arr.includes(parseInt(this.radioCheck)))
      );
      console.log(index, data[index][2]);
      let payload = JSON.parse('{}');
      let store;

      if (this.radioCheck == 0 || this.radioCheck == 1) {
        //{ "CurrentPassphrase": "dddd", "NewPassphrase": "aaaa", "ConfirmPassphrase": "aaaa" }
        payload.CurrentPassphrase = this.BPS.Passphrase.current_password;
        payload.NewPassphrase = this.BPS.Passphrase.new_password;
        payload.ConfirmPassphrase = this.BPS.Passphrase.confirm_password;
        store = 'insydememorystore/updateSecurityActionwith3param';
      } else {
        //{"Passphrase":"aaaa"}
        payload.Passphrase = this.BPS.CheckPassphrase.password;
        store = 'insydememorystore/updateSecurityAction';
      }
      //payload = JSON.stringify(payload);
      payload.action = data[index][2];
      console.log(payload, typeof payload);
      //.dispatch('insydememorystore/getDimmMetrics')
      this.startLoader();

      this.$store
        .dispatch(store, payload)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
    saveUser({ userData }) {
      this.startLoader();

      this.$store
        .dispatch('users/createUser', userData)
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.endLoader();
        });
    },
    requirePassword() {
      //if (this.$v.BPS.CheckPassphrase.password.$dirty) return true;
      //if (this.$v.BPS.CheckPassphrase.passwordConfirmation.$dirty) return true;
      console.log(this.radioCheck);
      let passwordrequired;
      if (this.radioCheck == 0 || this.radioCheck == 1) {
        console.log(
          'this.$v.BPS.Passphrase.current_password.$dirty',
          this.$v.BPS.Passphrase.current_password.$dirty
        );
        console.log(
          'this.$v.BPS.Passphrase.new_password.$dirty',
          this.$v.BPS.Passphrase.new_password.$dirty
        );
        console.log(
          'this.$v.BPS.confirm_password.$dirty',
          this.$v.BPS.Passphrase.confirm_password.$dirty
        );
      } else {
        console.log(
          'this.$v.BPS.CheckPassphrase.password.$dirty',
          this.$v.BPS.CheckPassphrase.password.$dirty
        );
        passwordrequired = this.$v.BPS.CheckPassphrase.password.$dirty;
      }
      if (passwordrequired) return true;
      if (this.$v.BPS.CheckPassphrase.passwordConfirmation) return true;
      return false;
    },
  },
};
</script>

<style>
.div-button {
  margin: 4px;
  padding: 2px;
  background: rgb(240, 240, 245);
  border: 2px solid rgb(204, 230, 255);
}
.radio-table {
  display: table;
  border-collapse: separate;
  border-spacing: 2px;
}

.radio-tr {
  display: table-row;
}

/* round Radio */

.radio-round-container {
  min-width: 70px;
  padding-right: 20px;
  display: table-cell;
}

.radio-round-cell-label::before {
  content: '';
  position: relative;
  top: 4px;
  display: inline-block;
  width: 16px;
  height: 16px;
  background: #ccc;
  border-radius: 50%;
  margin-right: 12px;
}

.radio-round-cell-label {
  position: relative;
  padding: 0;
  font-size: 12px;
  line-height: 28px;
  min-width: 25px;
  color: #000000;
  cursor: pointer;
}

.radio-round-option {
  position: absolute;
  display: none;
}

.radio-round-option.Pulse:enabled + label::before {
  background: #99dbff;
}

.radio-round-option.Pulse:enabled + label {
  color: #000000;
}

.radio-round-option.Pulse:enabled + label::after {
  content: '';
  position: absolute;
  left: -1px;
  top: -2px;
  width: 18px;
  height: 18px;
  border: 1px solid #99dbff;
  border-radius: 50%;
  animation: pulse 1s linear infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
    transform: scale(0.5);
  }
  25% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.container-flex {
  display: flex;
  line-height: 28px;
  font-size: 12px;
  padding: 5px 0px;

  user-select: none;
  -o-user-select: none;
  -moz-user-select: -moz-none;
  -webkit-user-select: none;
}

.container-flex.hide {
  display: none;
}

.container-flex:not(.hide).horizontal {
  flex-direction: row;
}

.container-flex:not(.hide).vertical {
  flex-direction: column;
}

.container-flex.left {
  justify-content: flex-start;
}

.container-flex.right {
  justify-content: flex-end;
}

.container-grid {
  display: grid;
  line-height: 28px;
  font-size: 12px;
  padding: 5px 0px;

  user-select: none;
  -o-user-select: none;
  -moz-user-select: -moz-none;
  -webkit-user-select: none;
}

.container-grid.hide {
  display: none;
}

.no-bound {
  margin: 0px;
  padding: 0px;
}

.radio-round-option:checked + label::before {
  background: #005097;
}

.radio-round-option:checked + label {
  color: #005097;
}

.radio-round-option:checked + label::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 4px;
  background: #e5e5e5;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* disabled */
.radio-round-option:disabled + label {
  position: relative;
  padding: 0;
  min-width: 25px;
  color: #ccc;
  cursor: not-allowed;
}

.radio-round-option:checked:disabled + label::before {
  background: #000000;
}

.radio-round-option:checked:disabled + label {
  color: #000000;
}

.radio-round-option:checked:disabled + label::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 4px;
  background: #e5e5e5;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* box Radio */

.radio-box-container {
  min-width: 70px;
  display: table-cell;
  margin: 5px;
}

.radio-box-cell-label {
  position: relative;
  padding: 0;
  font-size: 12px;
  line-height: 28px;
  width: 100%;
  height: 100%;
  color: #ffffff;
  background: #e5e5e5;
  cursor: pointer;
  padding: 0px 6px;
}

.radio-box-option {
  display: none;
}

.radio-box-option:checked + div {
  color: #ffffff;
  background: #005097;
  cursor: default;
}

.radio-box-option:disabled + div {
  background: transparent;
  color: #ccc;
  cursor: not-allowed;
}

.radio-box-option:checked:disabled + div {
  background: #000000;
}

.password-container {
  display: inline-flex;
}

.password {
  font-size: 12px;
  line-height: 28px;
  position: relative;
  border: 2px solid #005097;
  border-radius: 3px;
  outline: none;
  padding: 0px 4px;
  min-width: 230px;
}

.password.correct {
  border-color: #33ff33;
}

.password.error {
  border-color: #ff0000;
}

.password:disabled {
  border-color: #696969;
  background-color: #ffffff;
}

.password:disabled::-webkit-input-placeholder {
  color: #ffffff;
}

.password:disabled::placeholder {
  color: #ffffff;
}

.password-function {
  position: relative;
}

.password-function-hint-delete {
  position: absolute;
  left: -29px;
  top: -3px;
  padding: 8px 8px 2px 8px;
  opacity: 0;
}

.password-function-hint-delete.active {
  opacity: 1;
}

.password-function-hint-eye {
  position: absolute;
  padding: 8px 8px 2px 8px;
  opacity: 1;
  cursor: pointer;
}

.password-function-hint-eye.active path {
  fill: #005097;
}

/* icon */
svg.icon-correct {
  width: 20px;
  height: 20px;
}

svg.icon-correct circle {
  cx: 10px;
  cy: 10px;
  r: 9px;
  fill: none;
}

svg.icon-correct polyline {
  fill: none;
  stroke: rgb(112, 219, 112);
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  stroke-width: 2px;
}

svg.icon-error {
  width: 20px;
  height: 20px;
}

svg.icon-error circle {
  fill: none;
}

svg.icon-error polyline {
  fill: none;
  stroke: rgb(237, 0, 0);
  stroke-width: 2px;
}

svg.icon-info {
  width: 20px;
  height: 20px;
}

svg.icon-info .outer_circle {
  cx: 10px;
  cy: 10px;
  r: 9px;
  fill: rgb(128, 128, 128);
  stroke: rgb(204, 204, 204);
}

svg.icon-info .question_circle {
  cx: 10px;
  cy: 6px;
  r: 1px;
  fill: white;
}

svg.icon-info polyline {
  cx: 10px;
  cy: 6px;
  r: 1px;
  fill: none;
  stroke: white;
  stroke-width: 2px;
}

svg.icon-info polyline {
  fill: none;
  stroke: white;
  stroke-width: 2px;
}

svg.icon-delete {
  width: 15px;
  height: 15px;
}

svg.icon-delete circle {
  cx: 7.5px;
  cy: 7.5px;
  r: 6.5px;
  fill: none;
}

svg.icon-delete polyline {
  fill: none;
  stroke: rgb(115, 115, 115);
  stroke-width: 1.5px;
}

svg.icon-eye {
  width: 20px;
  height: 20px;
}

/* load */
svg.load-error {
  width: 144px;
  height: 144px;
}

/* checkbox */
svg.check-box.check {
  width: 16px;
  height: 16px;
}

svg.check-box.check rect {
  width: 15px;
  height: 15px;
  fill: rgb(0, 64, 128);
  stroke-width: 1px;
  stroke: rgb(0, 204, 255);
}

svg.check-box.uncheck {
  width: 16px;
  height: 16px;
}

svg.check-box.uncheck rect {
  width: 15px;
  height: 15px;
  fill: rgb(237, 0, 0);
  stroke-width: 1px;
  stroke: rgb(255, 51, 0);
}

svg.check-box polyline {
  fill: none;
  stroke-width: 3px;
  stroke: rgb(255, 255, 255);
}

svg.check-circle.check {
  width: 18px;
  height: 18px;
}

svg.check-circle.check circle {
  cx: 9px;
  cy: 9px;
  r: 8px;
  fill: rgb(0, 64, 128);
  stroke-width: 1px;
  stroke: rgb(0, 204, 255);
}

svg.check-circle.uncheck {
  width: 18px;
  height: 18px;
}

svg.check-circle.uncheck circle {
  cx: 9px;
  cy: 9px;
  r: 8px;
  fill: rgb(237, 0, 0);
  stroke-width: 1px;
  stroke: rgb(255, 51, 0);
}

svg.check-circle polyline {
  fill: none;
  stroke-width: 2px;
  stroke: rgb(255, 255, 255);
}

label.title {
  position: relative;
  top: 2px;
  min-width: 250px;
  user-select: none;
  -o-user-select: none;
  -moz-user-select: -moz-none;
  -webkit-user-select: none;
}

.button {
  font-size: 12px;
  font-weight: bold;
  padding: 5px 10px;
  text-align: center;
  background-color: #009ce1;
  border-left-style: none;
  border-right-style: none;
  border-bottom: 2px solid #41a2e2;
  border-radius: 3px;
  color: white;
  outline: 0;
  margin: 5px 3px;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.button:disabled {
  background-color: silver;
  border-bottom: 2px solid silver;
  cursor: not-allowed;
}

.button:enabled:hover {
  background-color: #2585bd;
  border-bottom: 2px solid #2585bd;
  color: #fff100;
}

.button:enabled:active {
  background-color: #013963;
  border-bottom: 2px solid #013963;
  color: #fff100;
}

.input-password-toggle-container {
  position: relative;
}
</style>
