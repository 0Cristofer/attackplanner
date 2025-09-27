/*
 * Script Name: Attack Planner
 * Version: v1.1.0
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
        version: 'v1.1.0',
        author: 'Cristofer',
        authorUrl: 'https://github.com/0Cristofer/attackplanner',
        helpLink: 'https://github.com/0Cristofer/attackplanner',
    },
    translations: {
        en_DK: {
            'Attack Planner': 'Attack Planner',
            'Step 1: Configuration': 'Step 1: Configuration',
            'Attack Group': 'Attack Group',
            'Support Group': 'Support Group',
            'Attack Units': 'Attack Units',
            'Support Units': 'Support Units',
            'Select 2': 'Select 2',
            'Target Coordinates': 'Target Coordinates',
            'Arrival Time': 'Arrival Time',
            'Enter coordinates (e.g. 500|500 501|501)': 'Enter coordinates (e.g. 500|500 501|501)',
            'Next Step': 'Next Step',
            'Reset Plan': 'Reset Plan',
            'Close': 'Close',
            'All Villages': 'All Villages',
            'Loading...': 'Loading...',
            'Please select exactly 2 attack units': 'Please select exactly 2 attack units',
            'Please select exactly 2 support units': 'Please select exactly 2 support units',
            'Please select arrival time': 'Please select arrival time',
            'Please enter at least one coordinate': 'Please enter at least one coordinate',
            'Invalid coordinate format': 'Invalid coordinate format',
            'Step 1 completed successfully!': 'Step 1 completed successfully!',
        },
        pt_BR: {
            'Attack Planner': 'Planejador de Ataque',
            'Step 1: Configuration': 'Passo 1: Configuração',
            'Attack Group': 'Grupo de Ataque',
            'Support Group': 'Grupo de Apoio',
            'Attack Units': 'Unidades de Ataque',
            'Support Units': 'Unidades de Apoio',
            'Select 2': 'Selecione 2',
            'Target Coordinates': 'Coordenadas do Alvo',
            'Arrival Time': 'Hora de Chegada',
            'Enter coordinates (e.g. 500|500 501|501)': 'Digite as coordenadas (ex. 500|500 501|501)',
            'Next Step': 'Próximo Passo',
            'Reset Plan': 'Resetar Plano',
            'Close': 'Fechar',
            'All Villages': 'Todas as Aldeias',
            'Loading...': 'Carregando...',
            'Please select exactly 2 attack units': 'Selecione exatamente 2 unidades de ataque',
            'Please select exactly 2 support units': 'Selecione exatamente 2 unidades de apoio',
            'Please select arrival time': 'Selecione a hora de chegada',
            'Please enter at least one coordinate': 'Digite pelo menos uma coordenada',
            'Invalid coordinate format': 'Formato de coordenada inválido',
            'Step 1 completed successfully!': 'Passo 1 concluído com sucesso!',
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

        // Global state
        let planState = {
            step: 1,
            config: {
                attackGroup: null,
                supportGroup: null,
                attackUnit1: null,
                attackUnit2: null,
                supportUnit1: null,
                supportUnit2: null,
                coordinates: [],
                arrivalTime: null
            },
            assignments: [],
            excludedVillages: []
        };

        // Data cache
        let worldData = {
            groups: [],
            units: [],
            unitInfo: null
        };

        // Entry Point
        (async function () {
            await initializeAttackPlanner();
        })();

        // Initialize Attack Planner
        async function initializeAttackPlanner() {
            try {
                // Load cached plan if exists
                loadSavedPlan();
                
                // Fetch required data
                await fetchRequiredData();
                
                // Build UI based on current step
                buildCurrentStepUI();
                
            } catch (error) {
                console.error(`${scriptInfo} Error initializing:`, error);
                UI.ErrorMessage('Failed to initialize Attack Planner');
            }
        }

        // Fetch Required Data
        async function fetchRequiredData() {
            try {
                // Fetch village groups
                await fetchVillageGroups();
                
                // Fetch world units
                await fetchWorldUnits();
                
                console.log(`${scriptInfo} Data loaded:`, worldData);
            } catch (error) {
                console.error(`${scriptInfo} Error fetching data:`, error);
                throw error;
            }
        }

        // Fetch Village Groups
        async function fetchVillageGroups() {
            try {
                const response = await jQuery.get(
                    game_data.link_base_pure + 'overview_villages&mode=groups'
                );
                
                const htmlDoc = jQuery.parseHTML(response);
                const groups = [{ id: 0, name: twSDK.tt('All Villages') }];
                
                jQuery(htmlDoc).find('select[name="group"] option').each(function() {
                    const groupId = parseInt(jQuery(this).val());
                    const groupName = jQuery(this).text().trim();
                    
                    if (groupId > 0) {
                        groups.push({ id: groupId, name: groupName });
                    }
                });
                
                worldData.groups = groups;
            } catch (error) {
                console.error(`${scriptInfo} Error fetching groups:`, error);
                // Fallback to default
                worldData.groups = [{ id: 0, name: twSDK.tt('All Villages') }];
            }
        }

        // Fetch World Units
        async function fetchWorldUnits() {
            try {
                worldData.unitInfo = await twSDK.getWorldUnitInfo();
                worldData.units = Object.keys(worldData.unitInfo.config);
            } catch (error) {
                console.error(`${scriptInfo} Error fetching units:`, error);
                // Fallback to common units
                worldData.units = ['spear', 'sword', 'axe', 'archer', 'spy', 'light', 'marcher', 'heavy', 'ram', 'catapult', 'knight', 'snob'];
            }
        }

        // Build Current Step UI
        function buildCurrentStepUI() {
            switch (planState.step) {
                case 1:
                    buildStep1UI();
                    break;
                case 2:
                    buildStep2UI();
                    break;
                case 3:
                    buildStep3UI();
                    break;
                default:
                    buildStep1UI();
            }
        }

        // Build Step 1 UI: Configuration
        function buildStep1UI() {
            const groupOptions = worldData.groups.map(group => 
                `<option value="${group.id}" ${planState.config.attackGroup == group.id ? 'selected' : ''}>${group.name}</option>`
            ).join('');

            const currentTime = new Date();
            currentTime.setHours(currentTime.getHours() + 1);
            const defaultTime = currentTime.toISOString().slice(0, 16);

            // Build unit pickers
            const attackUnitPicker = buildUnitPicker(
                [planState.config.attackUnit1, planState.config.attackUnit2].filter(Boolean),
                'ra-attack-units',
                'checkbox'
            );

            const supportUnitPicker = buildUnitPicker(
                [planState.config.supportUnit1, planState.config.supportUnit2].filter(Boolean),
                'ra-support-units', 
                'checkbox'
            );

            const content = `
                <div class="ra-step-header">
                    <h3>${twSDK.tt('Step 1: Configuration')}</h3>
                </div>
                
                <div class="ra-grid ra-grid-2 ra-mb15">
                    <div>
                        <label for="raAttackGroup">${twSDK.tt('Attack Group')}</label>
                        <select id="raAttackGroup" class="ra-select">
                            ${groupOptions}
                        </select>
                    </div>
                    <div>
                        <label for="raSupportGroup">${twSDK.tt('Support Group')}</label>
                        <select id="raSupportGroup" class="ra-select">
                            ${groupOptions}
                        </select>
                    </div>
                </div>

                <div class="ra-mb15">
                    <label>${twSDK.tt('Attack Units')} (${twSDK.tt('Select 2')})</label>
                    <div id="raAttackUnitsContainer">
                        ${attackUnitPicker}
                    </div>
                </div>

                <div class="ra-mb15">
                    <label>${twSDK.tt('Support Units')} (${twSDK.tt('Select 2')})</label>
                    <div id="raSupportUnitsContainer">
                        ${supportUnitPicker}
                    </div>
                </div>

                <div class="ra-mb15">
                    <label for="raTargetCoordinates">${twSDK.tt('Target Coordinates')}</label>
                    <textarea 
                        id="raTargetCoordinates" 
                        class="ra-textarea" 
                        placeholder="${twSDK.tt('Enter coordinates (e.g. 500|500 501|501)')}"
                    >${planState.config.coordinates.join(' ')}</textarea>
                </div>

                <div class="ra-mb15">
                    <label for="raArrivalTime">${twSDK.tt('Arrival Time')}</label>
                    <input 
                        type="datetime-local" 
                        id="raArrivalTime" 
                        class="ra-input"
                        value="${planState.config.arrivalTime || defaultTime}"
                    >
                </div>

                <div class="ra-action-buttons">
                    <a href="javascript:void(0);" id="raNextStepBtn" class="btn">
                        ${twSDK.tt('Next Step')}
                    </a>
                    <a href="javascript:void(0);" id="raResetPlanBtn" class="btn">
                        ${twSDK.tt('Reset Plan')}
                    </a>
                    <a href="javascript:void(0);" id="raCloseBtn" class="btn">
                        ${twSDK.tt('Close')}
                    </a>
                </div>
            `;

            renderUI(content);
            
            // Set saved values for groups
            if (planState.config.attackGroup !== null) {
                jQuery('#raAttackGroup').val(planState.config.attackGroup);
            }
            if (planState.config.supportGroup !== null) {
                jQuery('#raSupportGroup').val(planState.config.supportGroup);
            }

            // Register event handlers
            handleStep1Events();
        }

        // Build Unit Picker with Icons
        function buildUnitPicker(selectedUnits, nameAttribute, inputType) {
            if (!worldData.units || worldData.units.length === 0) {
                return `<div class="ra-loading">${twSDK.tt('Loading...')}</div>`;
            }

            let unitsTable = ``;
            let thUnits = ``;
            let tableRow = ``;

            worldData.units.forEach((unit) => {
                // Skip units that might not have graphics
                if (unit === 'militia') return;

                let checked = '';
                if (selectedUnits.includes(unit)) {
                    checked = `checked`;
                }

                thUnits += `
                    <th class="ra-tac">
                        <label for="${nameAttribute}_${unit}">
                            <img src="/graphic/unit/unit_${unit}.png" alt="${unit}" title="${unit}">
                        </label>
                    </th>
                `;

                tableRow += `
                    <td class="ra-tac">
                        <input name="${nameAttribute}" type="${inputType}" ${checked} id="${nameAttribute}_${unit}" class="ra-unit-selector" value="${unit}" />
                    </td>
                `;
            });

            unitsTable = `
                <table class="ra-table ra-table-v2 ra-unit-picker" width="100%">
                    <thead>
                        <tr>
                            ${thUnits}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            ${tableRow}
                        </tr>
                    </tbody>
                </table>
            `;

            return unitsTable;
        }

        // Handle Step 1 Events
        function handleStep1Events() {
            // Next Step button
            jQuery('#raNextStepBtn').on('click', function(e) {
                e.preventDefault();
                handleStep1Validation();
            });

            // Reset Plan button
            jQuery('#raResetPlanBtn').on('click', function(e) {
                e.preventDefault();
                resetPlan();
            });

            // Close button
            jQuery('#raCloseBtn').on('click', function(e) {
                e.preventDefault();
                closeAttackPlanner();
            });

            // Auto-save on input changes
            jQuery('#raAttackGroup, #raSupportGroup, #raTargetCoordinates, #raArrivalTime').on('change input', function() {
                autoSaveStep1();
            });

            // Auto-save on unit selection changes
            jQuery('input[name="ra-attack-units"], input[name="ra-support-units"]').on('change', function() {
                autoSaveStep1();
            });
        }

        // Handle Step 1 Validation
        function handleStep1Validation() {
            try {
                // Collect selected units
                const attackUnits = jQuery('input[name="ra-attack-units"]:checked').map(function() {
                    return jQuery(this).val();
                }).get();

                const supportUnits = jQuery('input[name="ra-support-units"]:checked').map(function() {
                    return jQuery(this).val();
                }).get();

                // Collect form data
                const formData = {
                    attackGroup: parseInt(jQuery('#raAttackGroup').val()),
                    supportGroup: parseInt(jQuery('#raSupportGroup').val()),
                    attackUnits: attackUnits,
                    supportUnits: supportUnits,
                    coordinatesText: jQuery('#raTargetCoordinates').val().trim(),
                    arrivalTime: jQuery('#raArrivalTime').val()
                };

                // Validate unit selections
                if (formData.attackUnits.length !== 2) {
                    UI.ErrorMessage(twSDK.tt('Please select exactly 2 attack units'));
                    return;
                }

                if (formData.supportUnits.length !== 2) {
                    UI.ErrorMessage(twSDK.tt('Please select exactly 2 support units'));
                    return;
                }

                // Validate arrival time
                if (!formData.arrivalTime) {
                    UI.ErrorMessage(twSDK.tt('Please select arrival time'));
                    return;
                }

                // Validate coordinates
                if (!formData.coordinatesText) {
                    UI.ErrorMessage(twSDK.tt('Please enter at least one coordinate'));
                    return;
                }

                const coordinates = formData.coordinatesText.match(twSDK.coordsRegex);
                if (!coordinates || coordinates.length === 0) {
                    UI.ErrorMessage(twSDK.tt('Invalid coordinate format'));
                    return;
                }

                // Save configuration
                planState.config = {
                    attackGroup: formData.attackGroup,
                    supportGroup: formData.supportGroup,
                    attackUnit1: formData.attackUnits[0],
                    attackUnit2: formData.attackUnits[1],
                    supportUnit1: formData.supportUnits[0],
                    supportUnit2: formData.supportUnits[1],
                    coordinates: coordinates,
                    arrivalTime: formData.arrivalTime
                };

                // Save and proceed
                savePlan();
                UI.SuccessMessage(twSDK.tt('Step 1 completed successfully!'));
                
                // For testing, log the configuration
                console.log(`${scriptInfo} Step 1 Configuration:`, planState.config);
                
                // TODO: Move to step 2
                // planState.step = 2;
                // buildCurrentStepUI();

            } catch (error) {
                console.error(`${scriptInfo} Step 1 validation error:`, error);
                UI.ErrorMessage('Validation failed');
            }
        }

        // Auto-save Step 1
        function autoSaveStep1() {
            try {
                const coordinates = jQuery('#raTargetCoordinates').val().match(twSDK.coordsRegex) || [];
                
                const attackUnits = jQuery('input[name="ra-attack-units"]:checked').map(function() {
                    return jQuery(this).val();
                }).get();

                const supportUnits = jQuery('input[name="ra-support-units"]:checked').map(function() {
                    return jQuery(this).val();
                }).get();
                
                planState.config = {
                    attackGroup: parseInt(jQuery('#raAttackGroup').val()) || null,
                    supportGroup: parseInt(jQuery('#raSupportGroup').val()) || null,
                    attackUnit1: attackUnits[0] || null,
                    attackUnit2: attackUnits[1] || null,
                    supportUnit1: supportUnits[0] || null,
                    supportUnit2: supportUnits[1] || null,
                    coordinates: coordinates,
                    arrivalTime: jQuery('#raArrivalTime').val() || null
                };
                
                savePlan();
            } catch (error) {
                console.error(`${scriptInfo} Auto-save error:`, error);
            }
        }

        // Placeholder functions for Step 2 and 3
        function buildStep2UI() {
            const content = `<div>Step 2: Target Assignment (Coming Soon)</div>`;
            renderUI(content);
        }

        function buildStep3UI() {
            const content = `<div>Step 3: Command Execution (Coming Soon)</div>`;
            renderUI(content);
        }

        // Render UI
        function renderUI(content) {
            const customStyle = `
                .ra-step-header h3 { margin: 0 0 15px 0; text-align: center; color: #603000; }
                .ra-grid { display: grid; grid-gap: 10px; }
                .ra-grid-2 { grid-template-columns: 1fr 1fr; }
                .ra-select, .ra-input, .ra-textarea { 
                    display: block; 
                    width: 100%; 
                    padding: 6px; 
                    font-size: 12px; 
                    border: 1px solid #c4a566;
                    border-radius: 2px;
                    background: #fff;
                }
                .ra-textarea { height: 60px; resize: vertical; }
                .ra-action-buttons { 
                    text-align: center; 
                    margin-top: 20px; 
                }
                .ra-action-buttons a { 
                    margin: 0 5px; 
                }
                label { 
                    display: block; 
                    margin-bottom: 3px; 
                    font-weight: bold; 
                    font-size: 11px;
                    color: #603000;
                }
                @media (max-width: 480px) {
                    .ra-grid-2 { grid-template-columns: 1fr; }
                }
            `;

            // Remove existing widget and create new one
            jQuery('#ra-attack-planner').remove();
            
            twSDK.renderFixedWidget(
                content,
                scriptConfig.scriptData.prefix,
                'ra-attack-planner',
                customStyle
            );
        }

        // Reset Plan
        function resetPlan() {
            if (confirm('Are you sure you want to reset the entire plan?')) {
                planState = {
                    step: 1,
                    config: {
                        attackGroup: null,
                        supportGroup: null,
                        attackUnit1: null,
                        attackUnit2: null,
                        supportUnit1: null,
                        supportUnit2: null,
                        coordinates: [],
                        arrivalTime: null
                    },
                    assignments: [],
                    excludedVillages: []
                };
                
                localStorage.removeItem(`${scriptConfig.scriptData.prefix}_plan`);
                buildCurrentStepUI();
                UI.SuccessMessage('Plan reset successfully');
            }
        }

        // Close Attack Planner
        function closeAttackPlanner() {
            jQuery('#ra-attack-planner').remove();
        }

        // Save Plan
        function savePlan() {
            try {
                localStorage.setItem(
                    `${scriptConfig.scriptData.prefix}_plan`, 
                    JSON.stringify(planState)
                );
            } catch (error) {
                console.error(`${scriptInfo} Error saving plan:`, error);
            }
        }

        // Load Saved Plan
        function loadSavedPlan() {
            try {
                const saved = localStorage.getItem(`${scriptConfig.scriptData.prefix}_plan`);
                if (saved) {
                    const savedPlan = JSON.parse(saved);
                    planState = { ...planState, ...savedPlan };
                    console.log(`${scriptInfo} Loaded saved plan:`, planState);
                }
            } catch (error) {
                console.error(`${scriptInfo} Error loading saved plan:`, error);
            }
        }
    }
);