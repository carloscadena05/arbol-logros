-- Crear base de datos
CREATE DATABASE IF NOT EXISTS arbol_logros;
USE arbol_logros;

-- Tabla de personas (simplificada)
CREATE TABLE IF NOT EXISTS personas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de logros (simplificada)
CREATE TABLE IF NOT EXISTS logros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    persona_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE
);

-- Datos de ejemplo
INSERT INTO personas (nombre) VALUES 
('Juan Pérez'),
('María García');

INSERT INTO logros (persona_id, titulo, descripcion) VALUES 
(1, 'Graduación Universitaria', 'Me gradué en Ingeniería de Sistemas'),
(1, 'Primer Trabajo', 'Conseguí mi primer empleo como desarrollador'),
(2, 'Certificación Angular', 'Completé certificación en Angular avanzado');