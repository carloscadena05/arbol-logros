CREATE DATABASE arbol_logros;
USE arbol_logros;

CREATE TABLE personas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    persona_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    fecha_logro DATE,
    nivel INT DEFAULT 1,
    padre_id INT NULL,
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE,
    FOREIGN KEY (padre_id) REFERENCES logros(id) ON DELETE SET NULL
);