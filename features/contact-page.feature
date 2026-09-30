Feature: Medavie Contact page
  As a Medavie customer
  I want to find the Medavie Blue Cross customer service phone numbers on the Contact page
  So that I can call the right number for my region, in English or in French

  @english
  Scenario: Verify Medavie Blue Cross contact information in English
    Given I open the Medavie homepage in "English"
    When I click on the "Contact" menu
    Then the "Contact" page is displayed
    And the "Medavie Blue Cross" section shows the following contact information:
      | Region              | Phone number   |
      | Atlantic Region     | 1-888-227-3400 |
      | Quebec              | 1-888-588-1212 |
      | Ontario             | 1-800-355-9133 |
      | Elsewhere in Canada | 1-800-667-4511 |
    And I close the browser

  @french
  Scenario: Vérifier les coordonnées de Croix Bleue Medavie en français
    Given I open the Medavie homepage in "French"
    When I click on the "Coordonnées" menu
    Then the "Coordonnées" page is displayed
    And the "Croix Bleue Medavie" section shows the following contact information:
      | Region                 | Phone number   |
      | Région de l’Atlantique | 1-888-227-3400 |
      | Québec                 | 1-888-588-1212 |
      | Ontario                | 1-800-355-9133 |
      | Ailleurs au Canada     | 1-800-667-4511 |
    And I close the browser
