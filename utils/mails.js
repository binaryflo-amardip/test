const getMail = (type, data) => {
  if (type == "registration") {
    return {
      subject: "Welkom bij saitcbr.nl!",
      body: `<body>
        <p><strong>Welkom bij saitcbr.nl!</strong></p>
        
        <p>Beste ${data.name},</p>
        
        <p>Welkom bij saitcbr.nl! Je account is succesvol geverifieerd.</p>
        
        <p>Onze cursussen zijn ontworpen om je te helpen slagen voor het CBR-examen. Je vindt duidelijke uitleg, interactieve quizzes, en oefenexamens om je goed voor te bereiden.</p>
        
        <p><strong>Zo Begin Je:</strong></p>
        
        <ul>
            <li>Bezoek onze website en kies je cursus.</li>
            <li>Volg je voortgang en oefen zoveel je wilt.</li>
        </ul>
        
        <p>Heb je vragen? We staan klaar om je te helpen.</p>
        
        <p>Veel succes met je theorie-examen!</p>
        
        <p>Met vriendelijke groet, Het saitcbr.nl Team</p>
      </body>`,
    };
  } else if (type == "otpverify") {
    return {
      subject: "Nieuwe verificatie code - saitcbr.nl",
      body: `<body>
        <p><strong>Nieuwe verificatie code voor saitcbr.nl</strong></p>
        
        <p>Beste Student,</p>
        
        <p>Je nieuwe verificatie code is: <strong style="font-size: 24px; color: #2563eb;">${data.otp}</strong></p>
        
        <p>Deze code is 5 minuten geldig. Voer de code in om je account te verifiëren.</p>
        
        <p>Als je deze code niet hebt aangevraagd, kun je deze e-mail negeren.</p>
        
        <p>Met vriendelijke groet, Het saitcbr.nl Team</p>
      </body>`,
    };
  } else if (type == "otplogin") {
    return {
      subject: "Verificatie code - saitcbr.nl",
      body: `<body>
          <p><strong>Verificatie code voor saitcbr.nl</strong></p>
          
          <p>Beste Student,</p>
          
          <p>Je verificatie code is: <strong style="font-size: 24px; color: #2563eb;">${data.otp}</strong></p>
          
          <p>Deze code is 5 minuten geldig. Voer de code in om je account te verifiëren.</p>
          
          <p>Met vriendelijke groet, Het saitcbr.nl Team</p>
        </body>`,
    };
  } else if (type == "updateprofile") {
    return {
      subject: "Je profiel is succesvol bijgewerkt!",
      body: `<body>
        <p><strong>Je profiel is succesvol bijgewerkt!</strong></p>
        
        <p>Beste Student,</p>
        
        <p>We willen je laten weten dat je profielinformatie op saitcbr.nl succesvol is bijgewerkt. De wijzigingen zijn direct van kracht.</p>
        
        <p>Als je deze wijzigingen niet hebt aangebracht, neem dan onmiddellijk contact op met onze klantenservice om je account te beveiligen.</p>
        
        <p>Bedankt dat je je gegevens up-to-date houdt!</p>
        
        <p>Met vriendelijke groet, Het saitcbr.nl Team</p>
      </body>`,
    };
  } else if (type == "resetpassword") {
    return {
      subject: "Je wachtwoord is succesvol gewijzigd!",
      body: `<body>
          <p><strong>Je wachtwoord is succesvol gewijzigd!</strong></p>
          
          <p>Beste Student,</p>
          
          <p>Dit is een bevestiging dat je wachtwoord voor je account bij saitcbr.nl succesvol is gewijzigd. Als je deze wijziging hebt aangebracht, hoef je verder niets te doen.</p>
          
          <p>Heb je deze wijziging niet aangevraagd? Neem dan onmiddellijk contact op met onze klantenservice om je account te beveiligen.</p>
          
          <p>Om de veiligheid van je account te waarborgen, raden we aan om regelmatig je wachtwoord te wijzigen en een uniek, sterk wachtwoord te gebruiken.</p>
          
          <p>Met vriendelijke groet, Het saitcbr.nl Team</p>
        </body>`,
    };
  } else if (type == "forgotpassword") {
    return {
      subject: "Reset je wachtwoord bij saitcbr.nl",
      body: `<body>
          <p><strong>Reset je wachtwoord bij saitcbr.nl</strong></p>
          
          <p>Beste Student,</p>
          
          <p>We hebben een verzoek ontvangen om je wachtwoord te resetten. Als je dit verzoek hebt gedaan, klik dan op de onderstaande link om je wachtwoord te resetten:</p>
          
          <p><a href="${data.resetUrl}" target="_blank">Wachtwoord Resetten</a></p>
          
          <p>Deze link is 24 uur geldig. Als je dit verzoek niet hebt ingediend, kun je deze e-mail negeren of contact met ons opnemen voor verdere assistentie.</p>
          
          <p>We raden aan om een sterk wachtwoord te kiezen dat je niet eerder hebt gebruikt.</p>
          
          <p>Met vriendelijke groet, Het saitcbr.nl Team</p>
        </body>`,
    };
  } else if (type == "coursepurchase") {
    return {
      subject: "Bedankt voor uw aankoop op saitcbr.nl!",
      body: `<body>
            <p><strong>Bedankt voor uw aankoop op saitcbr.nl!</strong></p>
            <p>Beste cursist,</p>
            <p>Gefeliciteerd! Uw aankoop van de ${data.course} is succesvol afgerond.</p>
            <p>U heeft nu toegang tot alle leerinhoud, interactieve quizzen en oefenexamens die u zullen helpen bij de voorbereiding op het CBR-examen.</p>
            <p><strong>Wat nu?</strong></p>
            <ul>
            <li>Log in op uw account en ga naar uw dashboard.</li>
            <li>Start uw cursus en volg uw voortgang.</li>
            <li>Gebruik de oefenexamens om u voor te bereiden op het echte examen.</li>
            </ul>
            <p>Veel succes met uw cursus en theorie-examen!</p>
            <p>Met vriendelijke groet, Het team van saitcbr.nl</p>
        </body>`,
    };
  }
};

module.exports = { getMail };
