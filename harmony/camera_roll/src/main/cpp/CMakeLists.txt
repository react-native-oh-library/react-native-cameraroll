cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

file(GLOB rnoh_camera_roll_SRC CONFIGURE_DEPENDS *.cpp)
add_library(rnoh_camera_roll SHARED ${rnoh_camera_roll_SRC})
target_include_directories(rnoh_camera_roll PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(rnoh_camera_roll PUBLIC rnoh)