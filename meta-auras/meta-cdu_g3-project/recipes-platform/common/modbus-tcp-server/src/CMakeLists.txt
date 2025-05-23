project (modbus-tcp-server CXX)
cmake_minimum_required (VERSION 2.8.10 FATAL_ERROR)
set (BUILD_SHARED_LIBRARIES OFF)
include (ExternalProject)
set (CMAKE_CXX_STANDARD 20)
set (CMAKE_CXX_STANDARD_REQUIRED ON)
set (
    CMAKE_CXX_FLAGS
    "${CMAKE_CXX_FLAGS} -lstdc++fs \
    -Werror \
    -Wall \
    -Wextra \
    -Wnon-virtual-dtor \
    -Wold-style-cast \
    -Wcast-align \
    -Wunused \
    -Woverloaded-virtual \
    -Wpedantic \
    -Wmisleading-indentation \
    -Wduplicated-cond \
    -Wduplicated-branches \
    -Wlogical-op \
    -Wnull-dereference \
    -Wuseless-cast \
    -Wdouble-promotion \
    -Wformat=2 \
    -Wno-sign-compare \
    -Wno-reorder \
    -Wno-unused-parameter \
    -Wno-unused-but-set-parameter \
    -Wno-missing-field-initializers \
    -Wno-old-style-cast \
    -Wno-useless-cast \
"
)

set (CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake ${CMAKE_MODULE_PATH})
set (SRC_FILES src/main.cpp src/server.cpp src/dbus_trans_queue.cpp src/configuration.cpp)
set (EXTERNAL_PACKAGES Boost sdbusplus-project nlohmann-json)
set (LINK_LIBS -lsystemd stdc++fs sdbusplus modbus)

link_directories (${EXTERNAL_INSTALL_LOCATION}/lib)
include_directories (${CMAKE_CURRENT_SOURCE_DIR}/include)

add_executable (modbus-tcp-server ${SRC_FILES})
add_dependencies (modbus-tcp-server sdbusplus-project)
target_link_libraries (modbus-tcp-server boost_coroutine ${LINK_LIBS})

install (TARGETS modbus-tcp-server DESTINATION bin)
