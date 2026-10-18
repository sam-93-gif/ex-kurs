function uppdateraTid() {
    const nu = new Date();

    const klocka = document.getElementById("clock");
    const datumElement = document.getElementById("date");

    const timmar = String(nu.getHours()).padStart(2, "0");
    const minuter = String(nu.getMinutes()).padStart(2, "0");
    const sekunder = String(nu.getSeconds()).padStart(2, "0");

    if (klocka) {
        klocka.textContent = `${timmar}:${minuter}:${sekunder}`;
    }

    const dagar = [
        "Söndag",
        "Måndag",
        "Tisdag",
        "Onsdag",
        "Torsdag",
        "Fredag",
        "Lördag"
    ];

    if (datumElement) {
        datumElement.textContent =
            `${dagar[nu.getDay()]} ${nu.getDate()}/${nu.getMonth() + 1}/${nu.getFullYear()}`;
    }

    uppdateraOppetStatus(nu);
}

function uppdateraOppetStatus(tid) {
    const dag = tid.getDay();
    const timmar = tid.getHours();
    const minuter = tid.getMinutes();
    const aktuellTid = timmar * 60 + minuter;

    let oppet = false;

    if (dag >= 1 && dag <= 5 && aktuellTid >= 420 && aktuellTid < 1080) {
        oppet = true;
    }

    if (dag === 6 && aktuellTid >= 540 && aktuellTid < 840) {
        oppet = true;
    }

    const status = document.getElementById("open-status");

    if (status) {
        status.textContent = oppet ? "Öppet just nu" : "Stängt just nu";
    }
}

uppdateraTid();
setInterval(uppdateraTid, 1000);

class Bokningslista {
    constructor() {
        try {
            this.bokningar = JSON.parse(localStorage.getItem("tassenBokningar")) || [];
        } catch {
            this.bokningar = [];
        }
    }

    antalBokningar(datum) {
        return this.bokningar.filter(bokning => bokning.datum === datum).length;
    }

    arFullbokat(datum) {
        return this.antalBokningar(datum) >= 8;
    }

    laggTill(bokning) {
        if (this.arFullbokat(bokning.datum)) {
            return false;
        }

        this.bokningar.push({
            id: Date.now(),
            hund: bokning.hund,
            agare: bokning.agare,
            datum: bokning.datum,
            tjanst: bokning.tjanst
        });

        this.spara();
        return true;
    }

    taBort(id) {
        this.bokningar = this.bokningar.filter(bokning => bokning.id !== id);
        this.spara();
    }

    spara() {
        localStorage.setItem("tassenBokningar", JSON.stringify(this.bokningar));
    }
}

const bokningslista = new Bokningslista();

const formularet = document.getElementById("booking-form");
const lista = document.getElementById("booking-items");
const meddelande = document.getElementById("booking-message");
const datumFalt = document.getElementById("booking-date");

function renderaBokningar() {
    if (!lista) return;

    lista.innerHTML = "";

    if (bokningslista.bokningar.length === 0) {
        const text = document.createElement("p");
        text.textContent = "Inga bokningsförfrågningar ännu.";
        lista.appendChild(text);
        return;
    }

    bokningslista.bokningar.forEach(function(bokning) {
        const kort = document.createElement("div");
        kort.className = "booking-item";

        const detaljer = document.createElement("div");
        detaljer.className = "booking-details";

        const hund = document.createElement("p");
        const hundNamn = document.createElement("strong");
        hundNamn.textContent = "Hund: ";
        hund.appendChild(hundNamn);
        hund.appendChild(document.createTextNode(bokning.hund));

        const agare = document.createElement("p");
        const agareNamn = document.createElement("strong");
        agareNamn.textContent = "Ägare: ";
        agare.appendChild(agareNamn);
        agare.appendChild(document.createTextNode(bokning.agare));

        const datum = document.createElement("p");
        const datumNamn = document.createElement("strong");
        datumNamn.textContent = "Datum: ";
        datum.appendChild(datumNamn);
        datum.appendChild(document.createTextNode(bokning.datum));

        const tjanst = document.createElement("p");
        const tjanstNamn = document.createElement("strong");
        tjanstNamn.textContent = "Tjänst: ";
        tjanst.appendChild(tjanstNamn);
        tjanst.appendChild(document.createTextNode(bokning.tjanst));

        detaljer.append(hund, agare, datum, tjanst);

        const knapp = document.createElement("button");
        knapp.type = "button";
        knapp.className = "delete-button";
        knapp.textContent = "Avboka";

        knapp.addEventListener("click", function() {
            bokningslista.taBort(bokning.id);
            if (meddelande) meddelande.textContent = "";
            renderaBokningar();
        });

        kort.append(detaljer, knapp);
        lista.appendChild(kort);
    });
}

if (formularet) {
    formularet.addEventListener("submit", function(event) {
        event.preventDefault();

        const hund = document.getElementById("dog-name").value.trim();
        const agare = document.getElementById("owner-name").value.trim();
        const datum = datumFalt.value;
        const tjanst = document.getElementById("service").value;

        if (!hund || !agare || !datum || !tjanst) {
            meddelande.textContent = "Fyll i alla fält.";
            return;
        }

        if (bokningslista.arFullbokat(datum)) {
            meddelande.textContent =
                "Tyvärr, den här dagen är fullbokad. Vi kan ta emot högst 8 hundar per dag.";
            return;
        }

        const sparad = bokningslista.laggTill({
            hund: hund,
            agare: agare,
            datum: datum,
            tjanst: tjanst
        });

        if (!sparad) {
            meddelande.textContent = "Den här dagen är fullbokad.";
            return;
        }

        meddelande.textContent = "Bokningsförfrågan har lagts till.";
        formularet.reset();
        renderaBokningar();
    });
}

if (datumFalt) {
    datumFalt.addEventListener("change", function() {
        if (bokningslista.arFullbokat(datumFalt.value)) {
            meddelande.textContent =
                "Den här dagen är fullbokad. Välj ett annat datum.";
            datumFalt.value = "";
        } else {
            meddelande.textContent = "";
        }
    });
}

const omdomen = [
    {
        text: "Min hund älskar att vara på Tassen!",
        person: "Anna"
    },
    {
        text: "Jättetrevlig personal och bra service.",
        person: "Erik"
    },
    {
        text: "Det känns tryggt att lämna min hund här.",
        person: "Sara"
    },
    {
        text: "Min hund är alltid glad när vi kommer till Tassen.",
        person: "Johan"
    },
    {
        text: "Ett mysigt och bra hunddagis.",
        person: "Emma"
    }
];

const omdomeKnapp = document.getElementById("next-review");

if (omdomeKnapp) {
    omdomeKnapp.addEventListener("click", function() {
        const slump = Math.floor(Math.random() * omdomen.length);
        const text = document.getElementById("review-text");
        const person = document.getElementById("review-author");

        if (text) {
            text.textContent = '"' + omdomen[slump].text + '"';
        }

        if (person) {
            person.textContent = "– " + omdomen[slump].person;
        }
    });
}

renderaBokningar();