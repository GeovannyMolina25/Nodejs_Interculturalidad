const sql = require('mssql');
const readlineSync = require('readline-sync');
const config = require('./dbconfig');

// Función para calcular la edad a partir de la fecha de nacimiento
function calculateAge(birthDate) {
    const today = new Date();
    const birthDateObject = new Date(birthDate);
    let age = today.getFullYear() - birthDateObject.getFullYear();
    const monthDiff = today.getMonth() - birthDateObject.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObject.getDate())) {
        age--;
    }

    return age;
}

// Función para generar el correo electrónico
function generateEmail(nombre, apellido, birthDate) {
    const year = new Date(birthDate).getFullYear();
    const yearDigits = year.toString().slice(-2);
    const email = `${nombre.charAt(0).toLowerCase()}${apellido.toLowerCase()}${yearDigits}@gsalcedo.com.ec`;
    return email;
}

// Función para insertar una persona en la base de datos
async function insertPerson() {
    try {
        // Leer datos desde la consola
        const nombre = readlineSync.question('Ingrese el nombre: ');
        const apellido = readlineSync.question('Ingrese el apellido: ');
        const cedula = readlineSync.question('Ingrese la cédula: ');
        const fechaNacimiento = readlineSync.question('Ingrese la fecha de nacimiento (YYYY-MM-DD): ');

        // Validar fecha de nacimiento
        const parsedDate = new Date(fechaNacimiento);
        if (isNaN(parsedDate)) {
            console.error('Fecha de nacimiento inválida.');
            return;
        }

        // Calcular la edad
        const edad = calculateAge(fechaNacimiento);

        // Generar el correo electrónico
        const email = generateEmail(nombre, apellido, fechaNacimiento);

        // Conectar a la base de datos
        let pool = await sql.connect(config);

        // Insertar la nueva persona
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('apellido', sql.VarChar, apellido)
            .input('cedula', sql.VarChar, cedula)
            .input('fechaNacimiento', sql.Date, fechaNacimiento)
            .input('edad', sql.Int, edad)
            .input('email', sql.VarChar, email)
            .query(`
                INSERT INTO Personas (Nombre, Apellido, Cedula, FechaNacimiento, Edad, Email)
                VALUES (@nombre, @apellido, @cedula, @fechaNacimiento, @edad, @email)
            `);

        console.log('Persona agregada exitosamente.');
        console.log(`Nombre: ${nombre}, Apellido: ${apellido}, Edad: ${edad}, Email: ${email}`);
    } catch (err) {
        console.error('Error al insertar en la base de datos:', err);
    } finally {
        sql.close();
    }
}

// Ejecutar la función para insertar una persona
insertPerson();
