CREATE TABLE complaints (

    complaint_id SERIAL PRIMARY KEY,

    student_id INT NOT NULL,

    category VARCHAR(50) NOT NULL,

    description TEXT,

    priority VARCHAR(20),

    status VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);