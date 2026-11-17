# CLI download benchmark

Консольный скрипт на Node.js: делает 10 последовательных HTTP(S)-запросов к указанному URL, дожидается полного ответа на каждый и печатает скорость скачивания.

## Единицы измерения

- среднее время запроса: `ms`
- суммарный объём: `MiB` (1 MiB = 1024 * 1024 bytes)
- скорость скачивания: `MiB/s` (суммарный объём / суммарное время серии)

## Запуск

```bash
npm start -- http://example.com/file.bin
# или
node src/run.js http://example.com/file.bin
```

В консоль выводятся только старт и скорость скачивания (`MiB/s`). Полные метрики с timestamp перезаписываются в `metrics.txt`.

## Локальный MinIO для теста

```bash
docker compose up -d
```

В bucket загружается [`asset/photo_visokogo_razresheniya.jpg`](asset/photo_visokogo_razresheniya.jpg) (~50 MiB).

```text
http://localhost:9000/heavy-files/photo_visokogo_razresheniya.jpg
```

Проверка:

```bash
npm start -- http://localhost:9000/heavy-files/photo_visokogo_razresheniya.jpg
```

Консоль MinIO: `http://localhost:9001` (`minioadmin` / `minioadmin`).

## Тесты

```bash
npm test
```
