import { PGlite } from "@electric-sql/pglite";
import { init_file } from './file_tools.ts';
import * as path from 'path';
import { mkdir } from "node:fs/promises";
import type { OverrideKeyword } from "typescript";

interface counts {
    films: number;
    realisateurs: number,
    films_realisateurs: number;
}

const db_path = ".db/pglite";

async function main() {
    console.log("Hello from Bun pglite demo!");

    //await init_file(db_path);
    await mkdir(path.dirname(db_path), { recursive: true });
    const db = new PGlite(db_path);
    const isDB = await checkDB(db)
    if (!isDB) {
        console.log("DB is empty, creating tables and inserting data...");
        await initDB(db);
        console.log("DB created");
        await fillinDB(db);
        console.log("DB filled with data");
    }

    showDB(db)
    .then((result) => {
        console.log(result);
    })
    .catch(() => { console.error("Oopsie!"); })
    .finally(() => { db.close(); });
/*
    db.query(`SELECT
    (SELECT count(*) FROM films) AS films,
    (SELECT count(*) FROM realisateurs) AS realisateurs,
    (SELECT COUNT(*) FROM films_realisateurs) AS films_realisateurs;
    `).then((result: unknown) => {
        const data = result as counts[];
        if (data[0].films > 0 && data[0].realisateurs > 0 && data[0].films_realisateurs > 0) {
            db.query(`SELECT AVG(duree) AS duree_moyenne FROM films;`).then(console.log);
            db.query(`
                SELECT f.titre, r.prenom || ' ' || r.nom AS realisateur
                FROM films f
                JOIN films_realisateurs fr ON f.film_id = fr.film_id
                JOIN realisateurs r ON r.realisateur_id = fr.realisateur_id;
            `).then((result) => {
                console.log(result);
                db.close();
            }).catch(() => {
            console.log("DB is empty, creating tables and inserting data...");
*/
}

async function checkDB(db: PGlite): Promise<boolean> {
    return db.query(`SELECT
    (SELECT count(*) FROM films) AS films,
    (SELECT count(*) FROM realisateurs) AS realisateurs,
    (SELECT COUNT(*) FROM films_realisateurs) AS films_realisateurs;
    `)
    .then(() => true )
    .catch(() => false );
}

async function initDB(db: PGlite): Promise<void> {
    await db.query(`CREATE TABLE films (
        film_id SERIAL PRIMARY KEY,
        titre VARCHAR(255) NOT NULL,
        description TEXT,
        annee_sortie INTEGER,
        duree INTEGER, -- Durée du film en minutes
        langue VARCHAR(50)
    );`);

    await db.query(`CREATE TABLE realisateurs (
        realisateur_id SERIAL PRIMARY KEY,
        prenom VARCHAR(255) NOT NULL,
        nom VARCHAR(255) NOT NULL,
        pays VARCHAR(100),
        date_naissance DATE
    );`);

    await db.query(`CREATE TABLE films_realisateurs (
        film_id INTEGER NOT NULL,
        realisateur_id INTEGER NOT NULL,
        FOREIGN KEY (film_id) REFERENCES films (film_id),
        FOREIGN KEY (realisateur_id) REFERENCES realisateurs (realisateur_id),
        PRIMARY KEY (film_id, realisateur_id)
    );`);
}

async function fillinDB(db: PGlite): Promise<void> {
    await db.query(`INSERT INTO films (titre, description, annee_sortie, duree, langue) VALUES
        ('Pulp Fiction', 'Les vies de deux hommes de main de la mafia, d''un boxeur, d''un gangster et de sa femme, et de deux braqueurs se tissent dans quatre histoires de violence et de rédemption.', 1994, 154, 'Anglais'),
        ('Le Voyage de Chihiro', 'Dans le Japon moderne, Chihiro, une fille de dix ans, se retrouve plongée dans un monde fantastique après que ses parents aient été transformés en cochons par une sorcière maléfique.', 2001, 125, 'Japonais');
    `);

    await db.query(`INSERT INTO realisateurs (prenom, nom, pays, date_naissance) VALUES
        ('Quentin', 'Tarantino', 'USA', '1963-03-27'),
        ('Hayao', 'Miyazaki', 'Japon', '1941-01-05');
    `);

    await db.query(`INSERT INTO films_realisateurs (film_id, realisateur_id) VALUES
        ((SELECT film_id FROM films WHERE titre = 'Pulp Fiction'), (SELECT realisateur_id FROM realisateurs WHERE nom = 'Tarantino')),
        ((SELECT film_id FROM films WHERE titre = 'Le Voyage de Chihiro'), (SELECT realisateur_id FROM realisateurs WHERE nom = 'Miyazaki'));
    `);
}

async function showDB(db: PGlite): Promise<{average: any, films: any}>{
    const [averageResult, filmsResult] = await Promise.all([
        db.query(`SELCT AVG(duree) AS duree_moyenne FROM films;`),
        db.query(`
            SELCT f.titre, r.prenom || ' ' || r.nom AS realisateur
            FROM films f
            JOIN films_realisateurs fr ON f.film_id = fr.film_id
            JOIN realisateurs r ON r.realisateur_id = fr.realisateur_id;
        `),
      ]);

      return {
        average: averageResult,
        films: filmsResult,
      };
}

main().catch(console.error);
