cmake_minimum_required(VERSION 3.14)
project(Kallipolis ZKKZG CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(kallipolis_kzg SHARED
    src/kzg_verifier.cpp
)

target_include_directories(kallipolis_kzg PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)
