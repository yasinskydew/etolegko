# CLI download benchmark

Консольный скрипт на Node.js: делает 10 последовательных HTTP(S)-запросов к указанному URL, дожидается полного ответа на каждый и печатает скорость скачивания.

## Единицы измерения

- среднее время запроса: `ms`
- суммарный объём: `MiB` (1 MiB = 1024 * 1024 bytes)
- скорость скачивания: `MiB/s` (суммарный объём / суммарное время серии)

## Запуск

Требования:

- Node.js >= 18
- Docker Engine >= 20.10
- Docker Compose >= 2.0 (`docker compose`)

```bash
npm start -- <url>
# или
node src/run.js <url>
```

Пример с локальным MinIO:

```bash
npm start -- http://localhost:9000/heavy-files/photo_visokogo_razresheniya.jpg
```

Консоль:

```text
Starting download benchmark: http://localhost:9000/heavy-files/photo_visokogo_razresheniya.jpg
Download speed: 137.074 MiB/s
```

Полные метрики с timestamp перезаписываются в `metrics.txt`.

## Локальный MinIO для теста

```bash
docker compose up -d
```

В bucket `heavy-files` загружается [`asset/photo_visokogo_razresheniya.jpg`](asset/photo_visokogo_razresheniya.jpg) (~50 MiB):

```text
http://localhost:9000/heavy-files/photo_visokogo_razresheniya.jpg
```

Консоль MinIO: `http://localhost:9001` (`minioadmin` / `minioadmin`).

## Тесты

```bash
npm test
```
