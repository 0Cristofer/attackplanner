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
            'Select units for timing calculations': 'Select units for timing calculations',
            'Target Coordinates': 'Target Coordinates',
            'Arrival Time': 'Arrival Time',
            'Enter coordinates (e.g. 500|500 501|501)': 'Enter coordinates (e.g. 500|500 501|501)',
            'Next Step': 'Next Step',
            'Reset Plan': 'Reset Plan',
            'Close': 'Close',
            'All Villages': 'All Villages',
            'Loading...': 'Loading...',
            'Please select at least 1 attack unit': 'Please select at least 1 attack unit',
            'Please select arrival time': 'Please select arrival time',
            'Please enter at least one coordinate': 'Please enter at least one coordinate',
            'Invalid coordinate format': 'Invalid coordinate format',
            'Step 1 completed successfully!': 'Step 1 completed successfully!',
            'Step 2: Target Assignment': 'Step 2: Target Assignment',
            'Target Analysis': 'Target Analysis',
            'Select Target': 'Select Target',
            'Reachable Villages': 'Reachable Villages',
            'Real Attack': 'Real Attack',
            'Fake Attack': 'Fake Attack',
            'Assign Village': 'Assign Village',
            'Previous Step': 'Previous Step',
            'Next Step': 'Next Step',
            'villages can reach this target': 'villages can reach this target',
            'Village assignments': 'Village assignments',
        },
        pt_BR: {
            'Attack Planner': 'Planejador de Ataque',
            'Step 1: Configuration': 'Passo 1: Configuração',
            'Attack Group': 'Grupo de Ataque',
            'Support Group': 'Grupo de Apoio',
            'Attack Units': 'Unidades de Ataque',
            'Support Units': 'Unidades de Apoio',
            'Select units for timing calculations': 'Selecione unidades para cálculos de tempo',
            'Target Coordinates': 'Coordenadas do Alvo',
            'Arrival Time': 'Hora de Chegada',
            'Enter coordinates (e.g. 500|500 501|501)': 'Digite as coordenadas (ex. 500|500 501|501)',
            'Next Step': 'Próximo Passo',
            'Reset Plan': 'Resetar Plano',
            'Close': 'Fechar',
            'All Villages': 'Todas as Aldeias',
            'Loading...': 'Carregando...',
            'Please select at least 1 attack unit': 'Selecione pelo menos 1 unidade de ataque',
            'Please select arrival time': 'Selecione a hora de chegada',
            'Please enter at least one coordinate': 'Digite pelo menos uma coordenada',
            'Invalid coordinate format': 'Formato de coordenada inválido',
            'Step 1 completed successfully!': 'Passo 1 concluído com sucesso!',
            'Step 2: Target Assignment': 'Passo 2: Atribuição de Alvos',
            'Target Analysis': 'Análise de Alvos',
            'Select Target': 'Selecionar Alvo',
            'Reachable Villages': 'Aldeias Alcançáveis',
            'Real Attack': 'Ataque Real',
            'Fake Attack': 'Ataque Falso',
            'Assign Village': 'Atribuir Aldeia',
            'Previous Step': 'Passo Anterior',
            'Next Step': 'Próximo Passo',
            'villages can reach this target': 'aldeias podem alcançar este alvo',
            'Village assignments': 'Atribuições de aldeias',
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
                attackUnits: [],
                supportUnits: [],
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
                const groups = [{ id: 0, name: twSDK.tt('All Villages') }];
                
                // Check if we're on mobile or desktop
                const isMobile = jQuery('#mobileHeader').length > 0;
                
                // Fetch the overview villages page to get groups
                const response = await jQuery.get(
                    game_data.link_base_pure + 'overview_villages'
                );
                
                const htmlDoc = jQuery.parseHTML(response);
                
                // Use the same approach as troop counter: find .vis_item and get groups
                const visItem = jQuery(htmlDoc).find('.vis_item').get()[0];
                
                if (visItem) {
                    const groupElements = visItem.getElementsByTagName(isMobile ? 'option' : 'a');
                    
                    for (let i = 0; i < groupElements.length; i++) {
                        const element = groupElements[i];
                        let groupName = element.textContent.trim();
                        
                        // Skip "wszystkie" (all villages) on mobile as it's already included
                        if (isMobile && groupName === 'wszystkie') continue;
                        
                        // Remove brackets/parentheses from group names (both mobile and desktop)
                        if ((groupName.startsWith('(') && groupName.endsWith(')')) ||
                            (groupName.startsWith('[') && groupName.endsWith(']'))) {
                            groupName = groupName.slice(1, -1);
                        }
                        
                        // Extract group ID
                        let groupId = 0;
                        if (isMobile) {
                            groupId = parseInt(element.getAttribute('value')) || 0;
                        } else {
                            const href = element.getAttribute('href');
                            if (href) {
                                const groupMatch = href.match(/group=(\d+)/);
                                if (groupMatch) {
                                    groupId = parseInt(groupMatch[1]);
                                }
                            }
                        }
                        
                        if (groupId > 0 && groupName) {
                            groups.push({ id: groupId, name: groupName });
                        }
                    }
                }
                
                console.log(`${scriptInfo} Found ${groups.length - 1} village groups:`, groups);
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
                planState.config.attackUnits || [],
                'ra-attack-units',
                'checkbox'
            );

            const supportUnitPicker = buildUnitPicker(
                planState.config.supportUnits || [],
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
                    <label>${twSDK.tt('Attack Units')} (${twSDK.tt('Select units for timing calculations')})</label>
                    <div id="raAttackUnitsContainer">
                        ${attackUnitPicker}
                    </div>
                </div>

                <div class="ra-mb15">
                    <label>${twSDK.tt('Support Units')} (${twSDK.tt('Select units for timing calculations')} - Optional)</label>
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
                if (formData.attackUnits.length === 0) {
                    UI.ErrorMessage(twSDK.tt('Please select at least 1 attack unit'));
                    return;
                }

                // Support units are optional - no validation needed

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
                    attackUnits: formData.attackUnits,
                    supportUnits: formData.supportUnits,
                    coordinates: coordinates,
                    arrivalTime: formData.arrivalTime
                };

                // Save and proceed
                savePlan();
                UI.SuccessMessage(twSDK.tt('Step 1 completed successfully!'));
                
                // For testing, log the configuration
                console.log(`${scriptInfo} Step 1 Configuration:`, planState.config);
                
                // Move to step 2
                planState.step = 2;
                buildCurrentStepUI();

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
                    attackUnits: attackUnits,
                    supportUnits: supportUnits,
                    coordinates: coordinates,
                    arrivalTime: jQuery('#raArrivalTime').val() || null
                };
                
                savePlan();
            } catch (error) {
                console.error(`${scriptInfo} Auto-save error:`, error);
            }
        }

        // Build Step 2 UI - Target Assignment
        async function buildStep2UI() {
            try {
                // Show loading message first
                const loadingContent = `
                    <div class="ra-step-header">
                        <h3>${twSDK.tt('Step 2: Target Assignment')}</h3>
                    </div>
                    <div style="text-align: center; padding: 20px;">
                        <p>${twSDK.tt('Loading...')}</p>
                    </div>
                `;
                renderUI(loadingContent);

                // Calculate reachable villages for each target
                const targetAnalysis = await analyzeTargets();
                
                const content = `
                    <div class="ra-step-header">
                        <h3>${twSDK.tt('Step 2: Target Assignment')}</h3>
                    </div>

                    <div class="ra-mb15">
                        <h4>${twSDK.tt('Target Analysis')}</h4>
                        <div id="raTargetAnalysis">
                            ${buildTargetAnalysisTable(targetAnalysis)}
                        </div>
                    </div>

                    <div class="ra-mb15" id="raTargetAssignmentSection" style="display: none;">
                        <h4>${twSDK.tt('Village assignments')}</h4>
                        <div id="raVillageAssignment">
                            <!-- Village assignment will be populated here -->
                        </div>
                    </div>

                    <div class="ra-action-buttons">
                        <a href="#" id="raPreviousStep" class="btn btn-cancel">${twSDK.tt('Previous Step')}</a>
                        <a href="#" id="raResetPlan" class="btn btn-cancel">${twSDK.tt('Reset')}</a>
                        <a href="#" id="raNextStep" class="btn btn-confirm-yes" style="display: none;">${twSDK.tt('Next Step')}</a>
                    </div>
                `;

                renderUI(content);
                handleStep2Events();

            } catch (error) {
                console.error(`${scriptInfo} Error building Step 2 UI:`, error);
                const errorContent = `
                    <div class="ra-step-header">
                        <h3>${twSDK.tt('Step 2: Target Assignment')}</h3>
                    </div>
                    <div style="text-align: center; padding: 20px;">
                        <p>Error loading target analysis. Please try again.</p>
                        <a href="#" id="raPreviousStep" class="btn btn-cancel">${twSDK.tt('Previous Step')}</a>
                    </div>
                `;
                renderUI(errorContent);
                
                // At least bind the back button
                jQuery('#raPreviousStep').on('click', function(e) {
                    e.preventDefault();
                    planState.step = 1;
                    buildCurrentStepUI();
                });
            }
        }

        // Helper functions for Step 2

        // Build Target Analysis Table
        function buildTargetAnalysisTable(targetAnalysis) {
            if (!targetAnalysis || targetAnalysis.length === 0) {
                return `<p>No targets found</p>`;
            }

            let tableHtml = `
                <table class="ra-table ra-table-v2" width="100%">
                    <thead>
                        <tr>
                            <th>Target</th>
                            <th>Reachable Villages</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            targetAnalysis.forEach(target => {
                tableHtml += `
                    <tr>
                        <td>${target.coordinate}</td>
                        <td>${target.reachableCount} ${twSDK.tt('villages can reach this target')}</td>
                        <td>
                            <a href="#" class="btn btn-confirm-yes ra-select-target" 
                               data-target="${target.coordinate}">${twSDK.tt('Select Target')}</a>
                        </td>
                    </tr>
                `;
            });

            tableHtml += `
                    </tbody>
                </table>
            `;

            return tableHtml;
        }

        // Analyze Targets - Calculate reachable villages using SDK
        async function analyzeTargets() {
            const targets = [];
            
            try {
                // Get all world villages using SDK
                const allVillages = await twSDK.worldDataAPI('village');
                
                // Filter to current player's villages
                const playerVillages = twSDK.filterVillagesByPlayerIds([game_data.player.id], allVillages);
                
                // Filter by selected groups if specified
                const availableVillages = await filterVillagesByGroups(playerVillages);
                
                for (const coordinate of planState.config.coordinates) {
                    const reachableVillages = calculateReachableVillagesForTarget(coordinate, availableVillages);
                    targets.push({
                        coordinate: coordinate,
                        reachableCount: reachableVillages.length,
                        reachableVillages: reachableVillages
                    });
                }

                return targets;
            } catch (error) {
                console.error(`${scriptInfo} Error analyzing targets:`, error);
                return [];
            }
        }

        // Filter villages by selected groups
        async function filterVillagesByGroups(playerVillages) {
            try {
                // If both groups are "All Villages" (id 0), return all player villages
                if (planState.config.attackGroup === 0 && 
                    (planState.config.supportGroup === 0 || !planState.config.supportGroup)) {
                    return playerVillages;
                }

                // For now, if specific groups are selected, we'll fetch group villages from overview
                // This is more complex and may require additional implementation
                // For MVP, return all player villages and handle group filtering later
                console.log(`${scriptInfo} Group filtering not fully implemented, using all villages`);
                return playerVillages;

            } catch (error) {
                console.error(`${scriptInfo} Error filtering villages by groups:`, error);
                return playerVillages;
            }
        }

        // Calculate reachable villages for a specific target
        function calculateReachableVillagesForTarget(targetCoord, availableVillages) {
            const reachableVillages = [];
            
            availableVillages.forEach(villageCoord => {
                // Calculate distance using SDK
                const distance = twSDK.calculateDistance(villageCoord, targetCoord);
                
                // For now, consider all villages reachable
                // Later we can add arrival time constraints and unit speed calculations
                reachableVillages.push({
                    coordinate: villageCoord,
                    distance: distance.toFixed(2)
                });
            });

            // Sort by distance (closest first)
            reachableVillages.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
            
            return reachableVillages;
        }

        // Handle Step 2 Events
        function handleStep2Events() {
            // Previous Step
            jQuery('#raPreviousStep').on('click', function(e) {
                e.preventDefault();
                planState.step = 1;
                buildCurrentStepUI();
            });

            // Reset Plan
            jQuery('#raResetPlan').on('click', function(e) {
                e.preventDefault();
                resetPlan();
            });

            // Select Target
            jQuery('.ra-select-target').on('click', function(e) {
                e.preventDefault();
                const targetCoord = jQuery(this).data('target');
                showVillageAssignment(targetCoord);
            });

            // Next Step (initially hidden)
            jQuery('#raNextStep').on('click', function(e) {
                e.preventDefault();
                // Check if at least one target has assignments
                if (planState.assignments.length > 0) {
                    planState.step = 3;
                    buildCurrentStepUI();
                } else {
                    UI.ErrorMessage('Please assign at least one village to a target');
                }
            });
        }

        // Show Village Assignment for Selected Target
        async function showVillageAssignment(targetCoord) {
            try {
                // Find the target analysis data
                const allVillages = await twSDK.worldDataAPI('village');
                const playerVillages = twSDK.filterVillagesByPlayerIds([game_data.player.id], allVillages);
                const availableVillages = await filterVillagesByGroups(playerVillages);
                const reachableVillages = calculateReachableVillagesForTarget(targetCoord, availableVillages);
                
                let assignmentHtml = `
                    <h5>${twSDK.tt('Reachable Villages')} for ${targetCoord}</h5>
                    <div class="ra-mb10">
                        <table class="ra-table ra-table-v2" width="100%">
                            <thead>
                                <tr>
                                    <th>Village</th>
                                    <th>Distance</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                reachableVillages.forEach(village => {
                    assignmentHtml += `
                        <tr>
                            <td>${village.coordinate}</td>
                            <td>${village.distance}</td>
                            <td>
                                <button class="btn btn-confirm-yes ra-assign-village" 
                                        data-village="${village.coordinate}" 
                                        data-target="${targetCoord}" 
                                        data-type="real">${twSDK.tt('Real Attack')}</button>
                                <button class="btn ra-assign-village" 
                                        data-village="${village.coordinate}" 
                                        data-target="${targetCoord}" 
                                        data-type="fake">${twSDK.tt('Fake Attack')}</button>
                            </td>
                        </tr>
                    `;
                });

                assignmentHtml += `
                            </tbody>
                        </table>
                    </div>
                `;

                jQuery('#raVillageAssignment').html(assignmentHtml);
                jQuery('#raTargetAssignmentSection').show();

                // Bind assignment events
                jQuery('.ra-assign-village').on('click', function(e) {
                    e.preventDefault();
                    const village = jQuery(this).data('village');
                    const target = jQuery(this).data('target');
                    const type = jQuery(this).data('type');
                    
                    assignVillageToTarget(village, target, type);
                });

            } catch (error) {
                console.error(`${scriptInfo} Error showing village assignment:`, error);
                UI.ErrorMessage('Failed to load village assignment');
            }
        }

        // Assign Village to Target
        function assignVillageToTarget(village, target, type) {
            try {
                // Find or create target assignment
                let targetAssignment = planState.assignments.find(a => a.target === target);
                if (!targetAssignment) {
                    targetAssignment = { target: target, villages: [] };
                    planState.assignments.push(targetAssignment);
                }

                // Add village assignment
                const existingIndex = targetAssignment.villages.findIndex(v => v.village === village);
                if (existingIndex >= 0) {
                    // Update existing assignment
                    targetAssignment.villages[existingIndex].type = type;
                } else {
                    // Add new assignment
                    targetAssignment.villages.push({
                        village: village,
                        type: type,
                        unit: type === 'real' && planState.config.attackUnits.length > 0 ? 
                              planState.config.attackUnits[0] : 'spear' // Default unit
                    });
                }

                // Handle village exclusion logic
                if (type === 'real') {
                    if (!planState.excludedVillages.includes(village)) {
                        planState.excludedVillages.push(village);
                    }
                } else {
                    // Remove from excluded if switching from real to fake
                    const excludedIndex = planState.excludedVillages.indexOf(village);
                    if (excludedIndex >= 0) {
                        planState.excludedVillages.splice(excludedIndex, 1);
                    }
                }

                // Save progress
                savePlan();
                
                // Show success and enable next step
                UI.SuccessMessage(`Village ${village} assigned as ${type} attack to ${target}`);
                jQuery('#raNextStep').show();

                // Refresh the assignment view
                showVillageAssignment(target);

            } catch (error) {
                console.error(`${scriptInfo} Error assigning village:`, error);
                UI.ErrorMessage('Failed to assign village');
            }
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