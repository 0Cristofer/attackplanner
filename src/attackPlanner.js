/*
 * Script Name: Attack Planner
 * Version: v1.0.0
 * Last Updated: 2025-09-27
 * Author: Cristofer
 * Author URL: https://github.com/0Cristofer/attackplanner
 * Description: Attack planning tool for Tribal Wars
 */

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Script Config
var scriptConfig = {
    scriptData: {
        prefix: 'attackPlanner',
        name: 'Attack Planner',
        version: 'v1.0.0',
        author: 'Cristofer',
        authorUrl: 'https://github.com/0Cristofer/attackplanner',
        helpLink: 'https://github.com/0Cristofer/attackplanner',
    },
    translations: {
        en_DK: {
            'Attack Planner': 'Attack Planner',
            'Target Coordinates': 'Target Coordinates',
            'Enter coordinates (e.g. 500|500)': 'Enter coordinates (e.g. 500|500)',
            'Plan Attack': 'Plan Attack',
            'Close': 'Close',
        },
        pt_BR: {
            'Attack Planner': 'Planejador de Ataque',
            'Target Coordinates': 'Coordenadas do Alvo',
            'Enter coordinates (e.g. 500|500)': 'Digite as coordenadas (ex. 500|500)',
            'Plan Attack': 'Planejar Ataque',
            'Close': 'Fechar',
        },
    },
    allowedMarkets: [],
    allowedScreens: [],
    allowedModes: [],
    isDebug: DEBUG,
    enableCountApi: true,
};

$.getScript(
    `https://twscripts.dev/scripts/twSDK.js`,
    async function () {
        // Initialize Library
        await twSDK.init(scriptConfig);
        const scriptInfo = twSDK.scriptInfo();

        // Entry Point
        (async function () {
            // Build and show the attack planner popup
            buildAttackPlannerPopup();
        })();

        // Build Attack Planner Popup
        function buildAttackPlannerPopup() {
            const content = `
                <div class="ra-mb15">
                    <label for="raTargetCoordinates">${twSDK.tt('Target Coordinates')}</label>
                    <input 
                        type="text" 
                        class="ra-input" 
                        id="raTargetCoordinates" 
                        placeholder="${twSDK.tt('Enter coordinates (e.g. 500|500)')}"
                    >
                </div>
                <div class="ra-action-buttons">
                    <a href="javascript:void(0);" id="raPlanAttackBtn" class="btn">
                        ${twSDK.tt('Plan Attack')}
                    </a>
                    <a href="javascript:void(0);" id="raCloseBtn" class="btn">
                        ${twSDK.tt('Close')}
                    </a>
                </div>
            `;

            const customStyle = `
                .ra-input { 
                    display: block; 
                    width: 100%; 
                    height: auto; 
                    padding: 8px; 
                    font-size: 14px; 
                    border: 1px solid #c4a566;
                    border-radius: 2px;
                }
                .ra-action-buttons { 
                    text-align: center; 
                    margin-top: 15px; 
                }
                .ra-action-buttons a { 
                    margin: 0 5px; 
                }
            `;

            // Create popup using SDK
            twSDK.renderFixedWidget(
                content,
                scriptConfig.scriptData.prefix,
                'ra-attack-planner',
                customStyle
            );

            // Register event handlers
            handlePlanAttack();
            handleClosePopup();
        }

        // Action Handler: Plan Attack
        function handlePlanAttack() {
            jQuery('#raPlanAttackBtn').on('click', function (e) {
                e.preventDefault();
                
                const coordinates = jQuery('#raTargetCoordinates').val().trim();
                
                if (!coordinates) {
                    UI.ErrorMessage('Please enter target coordinates');
                    return;
                }

                // Basic coordinate validation
                const coordPattern = /^\d{1,3}\|\d{1,3}$/;
                if (!coordPattern.test(coordinates)) {
                    UI.ErrorMessage('Invalid coordinate format. Use format: 500|500');
                    return;
                }

                // For now, just show success message
                UI.SuccessMessage(`Attack planned for ${coordinates}!`);
                console.log(`${scriptInfo} Attack planned for coordinates: ${coordinates}`);
            });
        }

        // Action Handler: Close Popup
        function handleClosePopup() {
            jQuery('#raCloseBtn').on('click', function (e) {
                e.preventDefault();
                jQuery('#ra-attack-planner').remove();
            });
        }
    }
);