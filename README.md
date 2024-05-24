# Päivänvalo minuutteina

Päivänvalo minuutteina äpillä voit lisätä kaupunkeja pylväsdiagrammiin, joka näyttää kuinka monta minuuttia valoa on vuoden mittaan eri kuukausina.

Koska API pyynöt ovat hitaita, äppi tallenttaa localStorageen minuutti tiedot.

Deployed with Vercel & Railway

### Edellytykset
Seuraavat asennettuna:
- [npm](https://www.npmjs.com/)
- [node](https://nodejs.org/en)
- [php](https://www.php.net/downloads.php)
- [composer](https://getcomposer.org/download/)

### Asennus

#### Respositorion kloonaaminen
```bash
git clone https://github.com/Wille-S/DayLenght.git
```
#### API avain OpenCage varten
Luo .env tiedosto backend kansion juureen johon lisää
```bash
OPEN_CAGE_API_KEY=Tähän se avain
```
#### PHP pakkausten asentaminen
```bash
cd backend
```
```bash
composer install
```
#### NPM pakkausten asentaminen
```bash
cd react_frontend
```
```bash
npm install
```
#### Backendin käynnistäminen
```bash
cd backend
```
```bash
php -S localhost:8000
```
#### Backendin käynnistäminen
```bash
cd react_frontend
```
```bash
npm start
```

### Käyttö

#### Alkunäkymä
Syötä hakukenttään haluamasi suomalainen kaupunki.
#### Pylväsdiagrammi
Pylväsdiagrammissa näkyy syötetyt kaupungit. Kaupunkeja voi lisätä samasta kentästä mistä ensimmäinenkin. Jos hiirtä pitää palkkien päällä saa tarkat minuuttitiedot kaupungeista. Painaen punaista näppäintä saa kaavion nollattua. Pudotusvalikosta painamalla saa tietyn kaupungin poistettua.

### Kiitokset 

Kiitokset seuraaville API-palveluille, joiden avulla tämä projekti on toteutettu:

- [OpenCage](https://opencagedata.com/) muuttaa kaupungin kordinaateiksi.
- [Sunrise Sunset](https://sunrise-sunset.org/api) kordinaattien kautta hakee auringonvalon pituuden.
