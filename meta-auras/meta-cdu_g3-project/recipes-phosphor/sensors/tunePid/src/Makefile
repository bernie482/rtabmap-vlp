#******************************************************************************
#   Insyde CopyRight
#
#   Workfile:  make file for tunePid
#
#   Abstract:  Makefile for building tunePid
#
#*****************************************************************************/

CXX_SRCS = $(wildcard *.cpp)
CXX_OBJS := ${CXX_SRCS:.cpp=.o}

TARGET := tunePid

.PHONY: all
all: $(TARGET)

$(TARGET): $(CXX_OBJS)
	$(CXX) $(CXXFLAGS) $(LDFLAGS) $^ -o $@

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

.PHONY: clean
clean:
	$(RM) $(CXX_OBJS) $(TARGET)