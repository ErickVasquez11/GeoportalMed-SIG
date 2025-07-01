 # Geoportal de Centros de Asistencia Médica – Versión 2.0

**Link de producción:** https://geoportalmed-sig-production.up.railway.app

Este proyecto amplía el *Geoportal de Centros de Asistencia Médica* con nuevas funcionalidades avanzadas de análisis espacial y navegación, con el objetivo de mejorar la accesibilidad a los servicios de salud, apoyar la toma de decisiones en planificación territorial y brindar una experiencia de usuario más completa.

---

## 🆕 Nuevas funcionalidades agregadas (Versión 2.0)

### 🗺️ 1. Análisis Espacial de Cobertura Médica y Zonas de Riesgo
- Implementación de **buffers de cobertura médica** (ej. radio de 1 km alrededor de cada centro).
- Detección visual en el mapa de **zonas desatendidas** (sin cobertura).
- Inclusión de capas complementarias como:
  - Densidad poblacional.
  - Barrios vulnerables.
  - Zonas con altas tasas de emergencias.
- Herramientas de análisis desarrolladas usando **QGIS** y visualizadas mediante **Leaflet + PostGIS**.

### 📍 2. Geocodificación Inversa y Cálculo de Rutas
- **Conversión de coordenadas en direcciones comprensibles** usando Google Maps API.
- Implementación de **OpenRouteService** para mostrar rutas óptimas desde la ubicación del usuario al centro médico más cercano.
- Integración con el **ChatBot** existente: permite consultas como _“¿Cómo llego al hospital más cercano?”_.
- Visualización de rutas directamente en el mapa.

---

## ✅ Características principales
- **Mapa interactivo en tiempo real** 
- **Visualización de centros de salud y sus coberturas.**
- **Filtros de búsqueda por tipo de servicio, ubicación y horario.**
- **ChatBot** integrado para asistencia médica automatizada.
- **Cálculo de rutas** desde la ubicación del usuario.
- **Análisis SIG** para planificación y detección de zonas críticas.

---

## 🚀 Tecnologías empleadas

| Componente               | Tecnología |
|--------------------------|------------|
| Backend                  | [Java](https://docs.oracle.com/en/java/) + [Spring Boot](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/) |
| Base de Datos            | [PostgreSQL](https://www.postgresql.org/docs/) + [PostGIS](https://postgis.net/documentation/) |
| Visualización Geoespacial| [Leaflet.js](https://leafletjs.com/reference.html) |
| Frontend                 | [Thymeleaf](https://www.thymeleaf.org/documentation.html) + [Bootstrap](https://getbootstrap.com/docs/) |
| Geocodificación Inversa  | [Google Maps API](https://developers.google.com/maps/documentation) |
| Ruteo                    | [Leaflet Routing Machine 3.2.12](https://www.liedman.net/leaflet-routing-machine/) |
| Análisis SIG             | [QGIS](https://docs.qgis.org/) |


---

## 📦 Instalación 
1. Clonar repositorio:
```bash
git clone https://github.com/ErickVasquez11/GeoportalMed-SIG
cd GeoportalMed-SIG
```
2. Instalar dependencias:
```bash
/npm install 
```
3. Ejecutar:
```bash
/npm run dev
```
4. Acceder vía navegador en: [http://localhost:5173](http://localhost:5173)

---

## 👨‍💻 Autores y Créditos

**Ampliación del sistema propuesta por:**
- Bran García, Diego Marcelo – 00080119  
- Flamenco Samour, Diego Andrés – 00221020  
- Vásquez Alfaro, Erick Rickelmy – 00065520  
- Paz Escobar, Christian Alejandro – 00132720

Este trabajo se desarrolló a partir del repositorio original:  
📌 **[Geoportal de Centros de Asistencia Médica](https://github.com/AndresMendoza0030/Geoportal)**

---

## 📖 Licencia

Este proyecto continúa bajo la **GPL v3**, compatible con el proyecto base Geoportal-Vacunacion, verificado mediante Scancode Toolkit.

---

## 📽️ Video

[![Ver Demo del Proyecto](https://img.youtube.com/vi/pLP1nZo5rhc/0.jpg)](https://youtu.be/pLP1nZo5rhc)


