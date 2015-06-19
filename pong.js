
// ************************************************************************************************************************

var Jeu = function() {
	var saTailleX = 900, saTailleY = 450, saTailleYScores = 60;
	var saCouleurTerrain = "#000", saCouleurLignes = "#0f0", saLargeurLignes = 10;
	var sonCanvasJeu, sonCanvasScores;
	var sonPinceau;
	var saBalle;
	var saRaquetteGauche, saRaquetteDroite;
	var sonTimerJeu, sonTimerAffichage;
	var sesPointsMax = 11;
	var saValeurDeplacementRaquetteGauche = 0, saValeurDeplacementRaquetteDroite = 0;
	var sonInstance = this;

	window.addEventListener('keydown', function(event) { sonInstance.appuiClavier(event); })
	window.addEventListener('keyup', function(event) { sonInstance.relacheClavier(event); })

	this.init = function() {
		sonCanvasJeu = document.getElementById("laZoneDeJouet");
		sonCanvasJeu.width = saTailleX;
		sonCanvasJeu.height = saTailleY;

		sonCanvasScores = document.getElementById("laZoneDeScores");
		sonCanvasScores.width = saTailleX;
		sonCanvasScores.height = saTailleYScores;

		sonPinceau = sonCanvasJeu.getContext("2d");
		sonStylo = sonCanvasScores.getContext("2d");

		saBalle = new Balle(sonPinceau);
		saRaquetteGauche = new Raquette(30, sonPinceau);
		saRaquetteDroite = new Raquette(saTailleX - 40, sonPinceau);

		alert('Joueur 1 : Touches \'A\' et \'Q\'\nJoueur 2 : Touches \'P\' et \'M\'\nMatch en 11 points !');
		
		sonTimerJeu = setInterval(function() { sonInstance.dessine(); }, 5);
		sonTimerAffichage = setInterval(function() {sonInstance.afficheScores(); }, 5);
	};

	this.appuiClavier = function(unEvenement) {
		if(unEvenement.keyCode == 65) { saValeurDeplacementRaquetteGauche = -2; } // Touche A
		if(unEvenement.keyCode == 81) { saValeurDeplacementRaquetteGauche = 2; }  // Touche Q
		if(unEvenement.keyCode == 80) { saValeurDeplacementRaquetteDroite = -2; } // Touche P
		if(unEvenement.keyCode == 77) { saValeurDeplacementRaquetteDroite = 2; }  // Touche M
	};

	this.relacheClavier = function(unEvenement) {
		if(unEvenement.keyCode == 65 || unEvenement.keyCode == 81) { saValeurDeplacementRaquetteGauche = 0; }
		if(unEvenement.keyCode == 80 || unEvenement.keyCode == 77) { saValeurDeplacementRaquetteDroite = 0; }
	};

	this.afficheScores = function() {
		sonStylo.clearRect(0,0,saTailleX,sonCanvasScores.height);
		sonStylo.font = "36px Calibri";
		sonStylo.fillStyle = "#00F";
		sonStylo.fillText("Joueur 1", 30, 40);
		sonStylo.fillText(saRaquetteGauche.getPoints(), 400, 40);
		sonStylo.fillStyle = "#F00";
		sonStylo.fillText("Joueur 2", 740, 40);
		sonStylo.fillText(saRaquetteDroite.getPoints(), 470, 40);
	}

	this.dessine = function() {
		sonPinceau.clearRect(0, 0, saTailleX, saTailleY);
		sonPinceau.fillStyle = saCouleurTerrain;
		sonPinceau.fillRect(0, 0, saTailleX, saTailleY);
		sonPinceau.fillStyle = saCouleurLignes;
		sonPinceau.fillRect(0, 0, saTailleX, saLargeurLignes); // Dessine la ligne du haut
		sonPinceau.fillRect(0, saTailleY - saLargeurLignes, saTailleX, saLargeurLignes); // Dessine la ligne du bas
        sonPinceau.fillRect(saTailleX / 2 - saLargeurLignes, 0, saLargeurLignes, saTailleY); // Dessine le filet

        // sonPinceau.fillRect(0, 0, saLargeurLignes, saTailleY); // Dessine la ligne de gauche (debug raquette)
        // sonPinceau.fillRect(saTailleX - saLargeurLignes, 0, saLargeurLignes, saTailleY); // Dessine la ligne de gauche (debug raquette)

        // Déplacements des raquettes : 
        if(
        	(saValeurDeplacementRaquetteGauche > 0 && saRaquetteGauche.getY() < saTailleY - saRaquetteGauche.getLongueur() - saLargeurLignes) 
        	|| 
        	(saValeurDeplacementRaquetteGauche < 0 && saRaquetteGauche.getY() > saLargeurLignes + 0))
        {
        	saRaquetteGauche.setVariation(saValeurDeplacementRaquetteGauche);
        	saRaquetteGauche.calculPosition();
        }

        if(
        	(saValeurDeplacementRaquetteDroite > 0 && saRaquetteDroite.getY() < saTailleY - saRaquetteDroite.getLongueur() - saLargeurLignes) 
        	|| 
        	(saValeurDeplacementRaquetteDroite < 0 && saRaquetteDroite.getY() > saLargeurLignes + 0))
        {
        	saRaquetteDroite.setVariation(saValeurDeplacementRaquetteDroite);
        	saRaquetteDroite.calculPosition();
        }
        // /Déplacements des raquettes

        // Collisions de la balle avec raquettes :
        // Si collision avec la raquette gauche : 
        if(saBalle.getX() - saBalle.getRayon() <= saRaquetteGauche.getX() + saRaquetteGauche.getLargeur()
        	&& saBalle.getY() <= saRaquetteGauche.getY() + saRaquetteGauche.getLongueur() + saBalle.getRayon()
        	&& saBalle.getY() >= saRaquetteGauche.getY() - saBalle.getRayon()
        	&& saBalle.getX() - saBalle.getRayon() >= saRaquetteGauche.getX())
        {
        	var milieuRaquette = (saRaquetteGauche.getY() + saRaquetteGauche.getLongueur()) - saRaquetteGauche.getY();
        	var rotation = -(saBalle.getRotation() + (5 * (milieuRaquette / (saRaquetteGauche.getLongueur() / 2))));
        	saRaquetteGauche.setLongueur(saRaquetteGauche.getLongueur() - 2);
        	saBalle.setVitesse(saBalle.getVitesse() + 0.1);
        	saBalle.setRotation(rotation);
        }

        // Si collision avec la raquette droite : 
        if(saBalle.getX() + saBalle.getRayon() >= saRaquetteDroite.getX()
        	&& saBalle.getY() <= saRaquetteDroite.getY() + saRaquetteDroite.getLongueur() + saBalle.getRayon()
        	&& saBalle.getY() >= saRaquetteDroite.getY() - saBalle.getRayon()
        	&& saBalle.getX() + saBalle.getRayon() <= saRaquetteDroite.getX() + saRaquetteDroite.getLargeur())
        {
        	var milieuRaquette = (saRaquetteDroite.getY() + saRaquetteDroite.getLongueur()) - saRaquetteDroite.getY();
        	var rotation = -(saBalle.getRotation() - (5 * (milieuRaquette / (saRaquetteDroite.getLongueur() / 2))));
        	saRaquetteDroite.setLongueur(saRaquetteDroite.getLongueur() - 2);
        	saBalle.setVitesse(saBalle.getVitesse() + 0.1);
        	saBalle.setRotation(rotation);
        }
        // /Collisions de la balle avec raquettes

        // Collisions de la balle (bords haut et bas) : 
        if(saBalle.getY() + saBalle.getRayon() > saTailleY - saLargeurLignes 
        	|| saBalle.getY() - saBalle.getRayon() < 0 + saLargeurLignes) 
        {
        	saBalle.setRotation(180 - saBalle.getRotation());
        }
        // /Collisions de la balle (bords haut et bas)

        // Balle qui sort (bords gauche et droit) : 
        if(saBalle.getX() >= saTailleX 
        	|| saBalle.getX() <= 0) 
        {
        	if(saBalle.getX() >= saTailleX) 
        	{
        		saRaquetteGauche.ajouterPoint();
        	} else if(saBalle.getX() <= 0) 
        	{
        		saRaquetteDroite.ajouterPoint();
        	}
        	saRaquetteGauche.setLongueur(100);
        	saRaquetteDroite.setLongueur(100);
        	saBalle.setVitesse(2);
        	saBalle.balleAuCentre(saTailleX/2, saTailleY/2);
        	saBalle.setRotation(-saBalle.getRotation());

        	sonInstance.victoire();
        }
        // /Balle qui sort (bords gauche et droit)

        saBalle.calculPosition();
        saRaquetteGauche.dessine();
        saRaquetteDroite.dessine();
    };

    this.victoire = function() {
    	if(saRaquetteGauche.getPoints() == sesPointsMax) 
    	{
    		clearInterval(sonTimerAffichage);
    		sonStylo.clearRect(0,0,saTailleX,saTailleYScores);
    		sonStylo.fillStyle = "#fff";
    		sonStylo.fillText("Joueur 1 gagne la partie !", saTailleX / 2 - 170, 40);
    		clearInterval(sonTimerJeu);
    	} else if(saRaquetteDroite.getPoints() == sesPointsMax) 
    	{
    		clearInterval(sonTimerAffichage);
    		sonStylo.clearRect(0,0,saTailleX, saTailleYScores);
    		sonStylo.fillStyle = "#fff";
    		sonStylo.fillText("Joueur 2 gagne la partie !", saTailleX / 2 - 170, 40);
    		clearInterval(sonTimerJeu);
    	}
    };
};

// ************************************************************************************************************************

var Balle = function(unPinceau) {
	var sonX = 100, sonY = 215;
	var sonRayon = 10;
	var saRotation = Math.floor((Math.random() * 90) + 45);
	var sonPinceau = unPinceau;
	var saVitesse = 2, saCouleur = "#0f0";

	this.balleAuCentre = function(unX, unY) {
		sonX = unX;
		sonY = unY;
	};

	this.getX = function() {
		return sonX;
	};

	this.getY = function() {
		return sonY;
	};

	this.getRayon = function() {
		return sonRayon;
	};

	this.setRayon = function(unRayon) {
		sonRayon = unRayon;
	};

	this.getCouleur = function() {
		return saCouleur;
	};

	this.getVitesse = function() {
		return saVitesse;
	};

	this.setVitesse = function(uneVitesse) {
		saVitesse = uneVitesse;
	};

	this.getRotation = function() {
		return saRotation;
	};

	this.setRotation = function(uneRotation) {
		saRotation = uneRotation;
	}

	this.calculPosition = function() {
		sonX -= saVitesse * Math.cos((Math.PI * (saRotation + 90) / 180));
		sonY -= saVitesse * Math.cos((Math.PI * saRotation / 180));

		this.dessine();
	};

	this.dessine = function() {
		sonPinceau.beginPath();
		sonPinceau.fillStyle = saCouleur;
		sonPinceau.arc(sonX, sonY, sonRayon, 0, 2 * Math.PI);
		sonPinceau.fill();
	};
};

// ************************************************************************************************************************

var Raquette = function(unX, unPinceau) {
	var sonX = unX, sonY = 175;
	var saLargeur = 10, saLongueur = 100;
	var saVariation = 0;
	var sonPinceau = unPinceau;
	var saVitesse = 2, saCouleur = "#0f0";
	var sesPoints = 0;

	this.getX = function() {
		return sonX;
	};

	this.getY = function() {
		return sonY;
	};

	this.getLargeur = function() {
		return saLargeur;
	};

	this.getLongueur = function() {
		return saLongueur;
	};

	this.setLongueur = function(uneLongueur) {
		saLongueur = uneLongueur;
	}

	this.setVariation = function(uneVariation) {
		saVariation = uneVariation;
	};

	this.getVariation = function() {
		return saVariation;
	};

	this.getCouleur = function() {
		return saCouleur;
	};

	this.getVitesse = function() {
		return saVitesse;
	};

	this.setVitesse = function(uneVitesse) {
		saVitesse = uneVitesse;
	};

	this.getPoints = function() {
		return sesPoints;
	};

	this.ajouterPoint = function() {
		sesPoints++;
	};

	this.calculPosition = function() {
		if(saVariation != 0) {
			sonY += saVariation;
		}
		this.dessine();
	};

	this.dessine = function() {
		sonPinceau.fillStyle = saCouleur;
		sonPinceau.fillRect(sonX, sonY, saLargeur, saLongueur);
	};
};