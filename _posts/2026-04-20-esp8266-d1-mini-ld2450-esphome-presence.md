---
layout: post
title: "ESP8266 D1 Mini Clone + LD2450 with ESPHome: Presence Detection"
date: 2026-04-20T10:00:00.000Z
author: eric
tags:
  - tutorial
  - esphome
  - homeassistant
  - esp8266
  - ld2450
  - smarthome
categories: [wiki]
---

# ESP8266 D1 Mini Clone + LD2450 with ESPHome: Presence Detection

I wanted a reliable presence sensor for my office using hardware I already had: an ESP8266 D1 Mini clone (CH340 based) and an LD2450 radar sensor. In theory this setup is simple. In practice, I ran into almost every classic issue: flashing errors, unstable serial communication, and confusing behavior between ESPHome, UART, and Home Assistant.

This post is the cleaned-up version of what finally worked for me.

## Goal

The target setup is straightforward:

1. flash an ESP8266 D1 Mini clone successfully
2. connect an LD2450 radar over UART
3. expose presence and target data in Home Assistant via ESPHome
4. keep the system stable enough for daily automation use

I am intentionally skipping the Home Assistant radar map/plot card in this article, because that part is still not stable in my setup.

## Hardware

- D1 Mini clone (ESP8266, CH340 USB-to-serial)
- LD2450 radar module
- USB cable and optionally USB hub/adapter (especially useful on newer Macs)
- Jumper wires

## Important Lesson Before You Start

Flash the board bare first.

Do not wire the LD2450 while you are still trying to flash firmware. The ESP8266 and the sensor can fight over UART lines, and you can end up with corrupted uploads or very misleading serial errors.

My stable workflow is:

1. flash ESP board alone
2. unplug USB power
3. wire the LD2450
4. power up again and test

## Flashing the ESP8266 Correctly

`esptool` is picky about argument order. Global options must come before `write-flash`, and you must provide a flash address.

Correct format:

```bash
./esptool --chip esp8266 --port /dev/cu.usbserial-XXXX write-flash 0x0 ../presence-sensor.bin
```

Useful checks:

```bash
ls /dev/cu.*
ssh-add -l
```

(Second command is unrelated to ESP flashing itself, but useful in mixed remote-dev environments.)

### If Flashing Fails Repeatedly

Common errors I saw:

- `No serial data received`
- `Invalid head of packet`

What helped:

- verify the exact current serial port each time (it can change)
- try lower baud rates if needed
- use a stable cable and, on some Macs, try with/without hub
- test another board early to rule out a defective clone

In my case, one board was simply bad. A replacement chip flashed immediately.

## Wiring LD2450 to D1 Mini

After flashing, wire the sensor like this:

- `LD2450 5V` -> `D1 Mini 5V`
- `LD2450 GND` -> `D1 Mini G`
- `LD2450 TX` -> `D1 Mini RX` (crossed)
- `LD2450 RX` -> `D1 Mini TX` (crossed)

The TX/RX cross is essential. If you wire TX->TX and RX->RX, you either get no data or endless parser warnings.

## ESPHome YAML (Working Baseline)

This baseline config gave me a stable start on ESP8266:

```yaml
esphome:
  name: presence-sensor
  friendly_name: Presence Sensor Büro

esp8266:
  board: d1_mini

# Disable hardware logging so it doesn't fight the radar on the RX/TX pins
logger:
  baud_rate: 0 

# Enable Home Assistant API
api:
  encryption:
    key: "encryptionkey"

ota:
  - platform: esphome
    password: "securepassword"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

  ap:
    ssid: "Presence-Sensor Fallback Hotspot"
    password: "uohdsaodhjpo"

captive_portal:

# --- RADAR CONFIGURATION --- #

# 1. Set up the Serial Connection
uart:
  id: uart_bus
  tx_pin: GPIO1 # The physical TX pin
  rx_pin: GPIO3 # The physical RX pin
  baud_rate: 115200
  parity: NONE
  stop_bits: 1
  rx_buffer_size: 1024

# 2. Initialize the LD2450
ld2450:
  id: ld2450_radar
  uart_id: uart_bus

# 3. Create the Home Assistant Sensors (The "God Mode" Block)
binary_sensor:
  - platform: ld2450
    ld2450_id: ld2450_radar
    has_target:
      name: "Presence Detected"

sensor:
  - platform: ld2450
    ld2450_id: ld2450_radar
    target_1:
      x:
        name: "Target 1 X Position"
      y:
        name: "Target 1 Distance"
      speed:
        name: "Target 1 Speed"
      resolution:
        name: "Target 1 Resolution"
    
    target_2:
      x:
        name: "Target 2 X Position"
      y:
        name: "Target 2 Distance"
      speed:
        name: "Target 2 Speed"
      resolution:
        name: "Target 2 Resolution"

    target_3:
      x:
        name: "Target 3 X Position"
      y:
        name: "Target 3 Distance"
      speed:
        name: "Target 3 Speed"
      resolution:
        name: "Target 3 Resolution"
```

## Why 115200 and Not 256000?

The LD2450 default is often 256000 baud. On ESP8266 clones, that can be unstable when Wi-Fi load and UART parsing happen at the same time. I got recurring warnings like:

```text
[W][ld2450:773]: Max command length exceeded; ignoring
```

Lowering the UART to 115200 and increasing `rx_buffer_size` made the system stable.

If you change baud rate in ESPHome, make sure the sensor itself is configured to the same speed (for example using the vendor app), otherwise the ESP will read garbage.

## Home Assistant Result

Once stable, I got exactly what I needed:

- binary presence (`Presence Detected`)
- target 1..3 x/y/speed/resolution sensors
- enough data to drive room automations

For my office lights, the practical first step was to automate against the binary presence sensor and only later add coordinate logic.

## Troubleshooting Checklist

If it does not work, this order saves time:

1. test flashing with board only (no sensor connected)
2. verify serial port each attempt (`ls /dev/cu.*`)
3. disable logger UART (`baud_rate: 0`)
4. verify TX/RX are crossed
5. set matching baud on both LD2450 and ESPHome
6. increase UART buffer (`rx_buffer_size: 1024`)
7. try a second board early (clone quality varies a lot)

## Final Thoughts

This setup is absolutely usable, but it is not plug-and-play on cheap ESP8266 clone boards. The big win for me was treating this as an integration problem, not a single bug: flashing sequence, wiring order, UART ownership, and baud settings all matter together.

After that, the core pipeline became reliable: LD2450 detects movement and presence, ESPHome parses it cleanly, and Home Assistant receives actionable entities for automation.

I will add a follow-up once my Home Assistant radar map visualization is stable enough to recommend.
