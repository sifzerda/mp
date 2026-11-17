// src/services/storageService.js

import AsyncStorage from "@react-native-async-storage/async-storage";

const writers = new Map();

export async function readJSON(key, fallback = null) {
  const value = await AsyncStorage.getItem(key);

  return value === null
    ? fallback
    : JSON.parse(value);
}

function getWriter(key) {
  if (!writers.has(key)) {
    writers.set(key, {
      running: false,
      pending: null,
    });
  }

  return writers.get(key);
}

async function processWrites(key, writer) {
  if (writer.running) return;

  writer.running = true;

  try {
    while (writer.pending) {
      const { value, callbacks } = writer.pending;

      writer.pending = null;

      try {
        await AsyncStorage.setItem(
          key,
          JSON.stringify(value)
        );

        callbacks.forEach(({ resolve }) => resolve());
      } catch (error) {
        callbacks.forEach(({ reject }) => reject(error));
      }
    }
  } finally {
    writer.running = false;
  }
}

export function writeJSON(key, value) {
  const writer = getWriter(key);

  return new Promise((resolve, reject) => {
    if (writer.pending) {
      writer.pending.value = value;

      writer.pending.callbacks.push({
        resolve,
        reject,
      });
    } else {
      writer.pending = {
        value,
        callbacks: [{ resolve, reject }],
      };
    }

    processWrites(key, writer);
  });
}