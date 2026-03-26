cmake_minimum_required(VERSION 3.20)
project(chiaki-ps5 VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)

find_package(Qt6 REQUIRED COMPONENTS Quick QuickControls2 Network)
find_package(Qt6 COMPONENTS Qt5Compat QUIET)

qt_add_executable(chiaki-ps5
    src/main.cpp
    src/hostmanager.cpp
    src/processmanager.cpp
)

qt_add_qml_module(chiaki-ps5
    URI ChiakiPS5
    VERSION 1.0
    QML_FILES
        qml/Main.qml
        qml/HomeView.qml
        qml/HostCard.qml
        qml/ControlBar.qml
        qml/SettingsOverlay.qml
        qml/StatusBar.qml
        qml/Theme.qml
    RESOURCES
        assets/ps4-console.svg
        assets/ps5-console.svg
        assets/background-gradient.svg
)

target_link_libraries(chiaki-ps5 PRIVATE
    Qt6::Quick
    Qt6::QuickControls2
    Qt6::Network
)

if(TARGET Qt6::Qt5Compat)
    target_link_libraries(chiaki-ps5 PRIVATE Qt6::Qt5Compat)
endif()

install(TARGETS chiaki-ps5 DESTINATION bin)
install(FILES scripts/chiaki-ps5.desktop DESTINATION share/applications)
