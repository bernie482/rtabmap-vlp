#******************************************************************************
#   Insyde CopyRight
#
#   Workfile:  make file for Auras STM32 io
#
#   Abstract:  Makefile for building Auras STM32 io service
#
#*****************************************************************************/

CXX_SRCS = $(wildcard *.cpp)
CXX_OBJS := ${CXX_SRCS:.cpp=.o}

TARGET := stm32io

.PHONY: all
all: $(TARGET)

$(TARGET): $(CXX_OBJS)
	$(CXX) $(CXXFLAGS) $(LDFLAGS) $^ -o $@

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

.PHONY: clean
clean:
	$(RM) $(CXX_OBJS) $(TARGET)