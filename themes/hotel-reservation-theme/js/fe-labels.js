(function () {
  'use strict';

  var replacementsEn = [
    [/Hotel Prime/g, 'FeWo Lauscha'],
    [/The Hotel Prime/g, 'FeWo Lauscha'],
    [/Hotel Location/g, 'Location'],
    [/Hotel Policies/g, 'Apartment policies'],
    [/Hotel Images/g, 'Apartment photos'],
    [/Hotel Details/g, 'Stay details'],
    [/Hotel Name/g, 'Apartment'],
    [/Hotel details not available\./g, 'Stay details not available.'],
    [/Hotel location not available\./g, 'Location not available.'],
    [/Room Information/g, 'Apartment details'],
    [/Product successfully added to your cart/g, 'Added to your booking'],
    [/Room successfully added to your cart/g, 'Stay dates added to your booking'],
    [/Explore the Interiors!/g, 'Explore the apartment'],
    [/sophisticated elegance of our hotel/g, 'comfort and character of our Ferienwohnung'],
    [/Step into the sophisticated elegance of our hotel/g, 'Step into a cozy Ferienwohnung at the forest edge'],
    [/Select Hotel/g, 'Select apartment'],
    [/Room type cost/g, 'Stay cost'],
    [/Rooms quantity added/g, 'Guests added'],
    [/Room occupancy/g, 'Guest count'],
    [/Total Product Cost in cart/g, 'Total add-ons in cart'],
    [/the-hotel-prime/g, 'fewo-lauscha']
  ];

  var replacementsDe = [
    [/Hotel Prime/g, 'FeWo Lauscha'],
    [/Hotelstandort/g, 'Standort'],
    [/Hotelrichtlinien/g, 'Hausregeln'],
    [/Hotelbilder/g, 'Wohnungsfotos'],
    [/Hoteldetails/g, 'Aufenthaltsdetails'],
    [/Zimmerinformationen/g, 'Wohnungsdetails'],
    [/Produkt erfolgreich in den Warenkorb gelegt/g, 'Zur Buchung hinzugefuegt'],
    [/Zimmer erfolgreich in den Warenkorb gelegt/g, 'Aufenthaltsdaten zur Buchung hinzugefuegt'],
    [/Entdecken Sie die Innenr[aä]ume!/g, 'Die Ferienwohnung entdecken'],
    [/raffinierte Eleganz unseres Hotels/g, 'Gemuetlichkeit unserer Ferienwohnung'],
    [/unseres Hotels/g, 'unserer Ferienwohnung'],
    [/Hotel wählen/g, 'Ferienwohnung waehlen'],
    [/Zimmerkosten/g, 'Aufenthaltskosten']
  ];

  var jsVarReplacementsEn = [
    [/var hotel_location_txt='Hotel Location';/g, "var hotel_location_txt='Location';"],
    [/var select_htl_txt='Select Hotel';/g, "var select_htl_txt='Select apartment';"],
    [/var hotel_name_cond='Please select a hotel name';/g, "var hotel_name_cond='Please select an apartment';"]
  ];

  var jsVarReplacementsDe = [
    [/var hotel_location_txt='Hotelstandort';/g, "var hotel_location_txt='Standort';"],
    [/var select_htl_txt='Hotel wählen';/g, "var select_htl_txt='Ferienwohnung waehlen';"]
  ];

  function applyReplacements(nodes, rules) {
    rules.forEach(function (rule) {
      nodes.forEach(function (node) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
          node.textContent = node.textContent.replace(rule[0], rule[1]);
        }
      });
    });
  }

  function patchInlineScripts(rules) {
    document.querySelectorAll('script').forEach(function (script) {
      if (!script.textContent) {
        return;
      }
      var updated = script.textContent;
      rules.forEach(function (rule) {
        updated = updated.replace(rule[0], rule[1]);
      });
      if (updated !== script.textContent) {
        script.textContent = updated;
      }
    });
  }

  function sanitizeTitle(rules) {
    if (!document.title) {
      return;
    }
    var title = document.title;
    rules.forEach(function (rule) {
      title = title.replace(rule[0], rule[1]);
    });
    title = title.replace(/\s*-\s*FeWo Lauscha\s*-\s*FeWo Lauscha/g, ' - FeWo Lauscha');
    title = title.replace(/^\s*-\s*/, '');
    document.title = title;
  }

  function run() {
    var lang = (document.documentElement.lang || 'en').slice(0, 2);
    var rules = lang === 'de' ? replacementsDe : replacementsEn;
    var jsRules = lang === 'de' ? jsVarReplacementsDe : jsVarReplacementsEn;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }
    applyReplacements(nodes, rules);
    patchInlineScripts(jsRules);
    sanitizeTitle(rules);

    document.querySelectorAll('a[href*="the-hotel-prime"]').forEach(function (link) {
      link.href = link.href.replace(/the-hotel-prime/g, 'fewo-lauscha');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
