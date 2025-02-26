document.addEventListener('DOMContentLoaded', async () => {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (!loadingOverlay) {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    document.body.appendChild(loadingOverlay);
  }

  const backgroundCanvas = document.getElementById('backgroundCanvas') || document.createElement('canvas');
  backgroundCanvas.id = 'backgroundCanvas';
  document.body.insertBefore(backgroundCanvas, document.body.firstChild);

  const backgroundManager = new BackgroundManager(backgroundCanvas);
  const imagesLoaded = await backgroundManager.loadImages();

  if (!imagesLoaded) {
    alert('Failed to load game images. Please refresh the page.');
    loadingOverlay.textContent = 'Failed to load images. Please refresh.';
    return;
  }

  loadingOverlay.style.display = 'none';

  const canvas = document.getElementById('gameCanvas') || document.createElement('canvas');
  canvas.id = 'gameCanvas';
  document.body.appendChild(canvas);
  
  const bulletContainer = document.createElement('div');
  bulletContainer.id = 'bullet-container';
  document.body.appendChild(bulletContainer);
  
  const magicButton = document.createElement('button');
  magicButton.classList.add('magic-button');
  magicButton.textContent = 'Randomize Background';
  document.body.appendChild(magicButton);
  
  magicButton.addEventListener('click', () => {
    backgroundManager.drawBackground(0, 0);
  });
  
  const galaxy = document.createElement('div');
  galaxy.classList.add('galaxy');
  document.body.appendChild(galaxy);
  
  const starCount = 50;
  
  function createStars() {
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      
      star.style.width = `${Math.random() * 3}px`;
      star.style.height = star.style.width;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      
      galaxy.appendChild(star);
    }
  }
  
  createStars();
  
  const game = new Game(canvas);
  game.backgroundManager = backgroundManager;

  const originalDraw = game.draw.bind(game);
  game.draw = () => {
    backgroundManager.drawBackground(game.player.worldX, game.player.worldY);
    originalDraw();
  };
  
  const restartButton = document.getElementById('restart-btn') || document.createElement('button');
  restartButton.id = 'restart-btn';
  restartButton.textContent = 'Restart';
  document.body.appendChild(restartButton);
  
  restartButton.addEventListener('click', () => {
    window.location.reload();
  });
  
  const scoreElement = document.getElementById('score') || document.createElement('span');
  scoreElement.id = 'score';
  document.body.appendChild(scoreElement);
  
  const killsElement = document.getElementById('kills') || document.createElement('span');
  killsElement.id = 'kills';
  document.body.appendChild(killsElement);
  
  const scoreOverlay = document.getElementById('score-overlay') || document.createElement('span');
  scoreOverlay.id = 'score-overlay';
  document.body.appendChild(scoreOverlay);
  
  const timerOverlay = document.getElementById('timer-overlay') || document.createElement('span');
  timerOverlay.id = 'timer-overlay';
  document.body.appendChild(timerOverlay);
  
  const stageOverlay = document.getElementById('stage-overlay') || document.createElement('span');
  stageOverlay.id = 'stage-overlay';
  document.body.appendChild(stageOverlay);
  
  const finalTimeElement = document.getElementById('final-time') || document.createElement('span');
  finalTimeElement.id = 'final-time';
  document.body.appendChild(finalTimeElement);
  
  const experienceBar = document.createElement('div');
  experienceBar.id = 'experience-bar';
  document.body.appendChild(experienceBar);
  
  const experienceBarFill = document.createElement('div');
  experienceBarFill.id = 'experience-bar-fill';
  experienceBar.appendChild(experienceBarFill);
  
  const experienceBarText = document.createElement('div');
  experienceBarText.id = 'experience-bar-text';
  experienceBar.appendChild(experienceBarText);
  
  const healthContainer = document.createElement('div');
  healthContainer.id = 'health-container';
  document.body.appendChild(healthContainer);
  
  for (let i = 1; i <= 3; i++) {
    const heartElement = document.createElement('div');
    heartElement.id = `heart${i}`;
    heartElement.classList.add('heart');
    healthContainer.appendChild(heartElement);
  }
  
  const gameOverElement = document.createElement('div');
  gameOverElement.id = 'game-over';
  gameOverElement.classList.add('hidden');
  document.body.appendChild(gameOverElement);
  
  const finalScoreElement = document.createElement('span');
  finalScoreElement.id = 'final-score';
  gameOverElement.appendChild(finalScoreElement);
  
  const finalKillsElement = document.createElement('span');
  finalKillsElement.id = 'final-kills';
  gameOverElement.appendChild(finalKillsElement);
  
  game.updateScoreDisplay = (score) => {
    scoreElement.textContent = ` ${score}`;
    scoreOverlay.textContent = `🏆 ${score}`;
  };

  game.updateKillsDisplay = (kills) => {
    killsElement.textContent = ` ${kills}`;
  };

  game.updateTimer = () => {
    const currentTime = Date.now();

    // If timer is paused, track pause duration
    if (game.timerPaused) {
      return;
    }

    const elapsedTime = currentTime - game.startTime - game.pausedTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    if (timerOverlay) {
      timerOverlay.textContent = `⏱️ ${formattedMinutes}:${formattedSeconds}`;
    }

    // Increment stage every 30 seconds without stopping
    if (seconds >= 30 && 
        Math.floor((currentTime - game.startTime) / 30000) > 
        Math.floor((game.lastStageIncreaseTime - game.startTime) / 30000)) {
      game.stage++;
      game.lastStageIncreaseTime = currentTime;
      game.updateStageDisplay();

      // Play songs at specific stages
      if (game.stage === 9 && game.aveMariaSong) {
        game.aveMariaSong.play().catch(error => {
          console.warn('Could not play Ave Maria song:', error);
        });
      }
      
      if (game.stage === 15 && game.dustSong) {
        game.dustSong.play().catch(error => {
          console.warn('Could not play Dust song:', error);
        });
      }
      
      if (game.stage === 22 && game.bosanska) {
        game.bosanska.play().catch(error => {
          console.warn('Could not play Bosanska song:', error);
        });
      }
      
      if (game.stage === 30 && game.gasaSong) {
        game.gasaSong.play().catch(error => {
          console.warn('Could not play Gasa song:', error);
        });
      }
      
      // Update backgroundManager's stage
      if (game.backgroundManager) {
        game.backgroundManager.updateStage(game.stage);
      }
    }
  };

  game.start();

  let debugKeySequence = '';
  const debugTrigger = 'debugx';

  document.addEventListener('keydown', (e) => {
    // Add the latest key to the sequence
    debugKeySequence += e.key.toLowerCase();
    
    // Trim the sequence to the length of the trigger
    debugKeySequence = debugKeySequence.slice(-debugTrigger.length);
    
    // Check if the last few keys match the debug trigger
    if (debugKeySequence.endsWith(debugTrigger)) {
      const debugModal = document.getElementById('debug-modal');
      if (debugModal) {
        debugModal.classList.remove('hidden');
      }
      
      // Reset the sequence to prevent repeated triggers
      debugKeySequence = '';
    }
  });

  const debugButton = document.getElementById('debug-button');
  const debugModal = document.getElementById('debug-modal');
  const closeModalButton = document.querySelector('.close-modal');
  const setStageButton = document.getElementById('set-stage-btn');
  const setHealthButton = document.getElementById('set-health-btn');
  const setExperienceButton = document.getElementById('set-experience-btn');
  const setSigmaSpeedButton = document.getElementById('set-sigma-speed-btn');
  const setSigmaDamageButton = document.getElementById('set-sigma-damage-btn');
  const setJonkbulletDamageButton = document.getElementById('set-jonkbullet-damage-btn');

  debugButton.style.display = 'none';

  closeModalButton.addEventListener('click', () => {
    debugModal.classList.add('hidden');
  });

  setStageButton.addEventListener('click', () => {
    const stageInput = document.getElementById('stage-input');
    const newStage = parseInt(stageInput.value, 10);
    
    if (game && !isNaN(newStage) && newStage > 0) {
      game.stage = newStage;
      game.updateStageDisplay();
      game.lastStageIncreaseTime = Date.now();
      debugModal.classList.add('hidden');
    }
  });

  setHealthButton.addEventListener('click', () => {
    const healthInput = document.getElementById('health-input');
    const newHealth = parseInt(healthInput.value, 10);
    
    if (game && !isNaN(newHealth) && newHealth > 0) {
      game.player.maxHealth = newHealth;
      game.player.health = newHealth;
      game.player.updateHealthDisplay();
      debugModal.classList.add('hidden');
    }
  });

  setExperienceButton.addEventListener('click', () => {
    const experienceInput = document.getElementById('experience-input');
    const newExperience = parseInt(experienceInput.value, 10);
    
    if (game && !isNaN(newExperience) && newExperience >= 0) {
      game.experience = newExperience;
      game.updateExperienceBar();
      debugModal.classList.add('hidden');
    }
  });

  setSigmaSpeedButton.addEventListener('click', () => {
    const sigmaSpeedInput = document.getElementById('sigma-speed-input');
    const newSigmaSpeed = parseFloat(sigmaSpeedInput.value);
    
    if (game && !isNaN(newSigmaSpeed) && newSigmaSpeed > 0) {
      game.sigmaSpeedMultiplier = newSigmaSpeed;
      debugModal.classList.add('hidden');
    }
  });

  setSigmaDamageButton.addEventListener('click', () => {
    const sigmaDamageInput = document.getElementById('sigma-damage-input');
    const newSigmaDamage = parseFloat(sigmaDamageInput.value);
    
    if (game && !isNaN(newSigmaDamage) && newSigmaDamage > 0) {
      game.player.damageMultiplier = newSigmaDamage;
      game.sigmaDamageMultiplier = newSigmaDamage;
      debugModal.classList.add('hidden');
    }
  });

  setJonkbulletDamageButton.addEventListener('click', () => {
    const jonkbulletDamageInput = document.getElementById('jonkbullet-damage-input');
    const newJonkbulletDamage = parseFloat(jonkbulletDamageInput.value);
    
    if (game && !isNaN(newJonkbulletDamage) && newJonkbulletDamage > 0) {
      game.bulletDamageMultiplier = newJonkbulletDamage;
      debugModal.classList.add('hidden');
    }
  });
});

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;
    
    this.player = new Player(this);
    this.bullets = [];
    this.enemies = [];
    this.xpOrbs = [];
    this.score = 0;
    this.kills = 0;
    this.gameOver = false;
    this.screamerBullets = [];
    this.neutronStars = [];
    this.retepBullets = [];
    this.healthPacks = [];
    this.lastHealthPackSpawnTime = 0;
    this.healthPackSpawnInterval = 20000; // 20 seconds
    
    this.keys = {};
    this.setupEventListeners();
    this.startTime = Date.now();
    this.experience = 0;
    this.experienceToNextLevel = 100; 
    this.level = 1;
    this.stage = 1;
    this.lastStageIncreaseTime = this.startTime;
    this.finalBoss = null;
    this.isBossPhase = false;
    this.timerPaused = false; 
    this.pausedTime = 0; 
    this.bossStartPauseTime = 0; 
    this.sigmaSpeedMultiplier = 1;
    this.sigmaDamageMultiplier = 1;
    this.bulletDamageMultiplier = 1;
    this.hasShownVictoryScreen = false;
    this.upgradeManager = new UpgradeManager(this);
    this.isPaused = false;
    this.mneuzeSound = this.createMneUzeSound();
    this.aveMariaSong = this.createAveMariaSong();
    this.dustSong = this.createDustSound();
    this.bosanska = this.createBosanska();
    this.gasaSong = this.createGasaSong();
    this.playInitialSong();
  }

  playInitialSong() {
    if (this.mneuzeSound) {
      // Attempt to play song, handling potential autoplay restrictions
      this.mneuzeSound.play().catch(error => {
        console.warn('Could not play initial mne uze sound:', error);
        
        // Add a user interaction listener to play the song
        const playInitialSongOnInteraction = () => {
          this.mneuzeSound.play().catch(console.warn);
          document.removeEventListener('click', playInitialSongOnInteraction);
        };
        
        document.addEventListener('click', playInitialSongOnInteraction);
      });
    }
  }

  createMneUzeSound() {
    const audio = new Audio('mne uze.mp3');
    audio.volume = 0.5; 
    audio.preload = 'auto'; 
    return audio;
  }

  createAveMariaSong() {
    const audio = new Audio('ave maria.mp3');
    audio.volume = 0.5; 
    audio.preload = 'auto';
    return audio;
  }

  createDustSound() {
    const audio = new Audio('dust.mp3');
    audio.volume = 0.5; 
    audio.preload = 'auto';
    return audio;
  }

  createBosanska() {
    const audio = new Audio('bosanska.mp3');
    audio.volume = 0.5; 
    audio.preload = 'auto';
    return audio;
  }

  createGasaSong() {
    const audio = new Audio('gasa.mp3');
    audio.volume = 0.5; 
    audio.preload = 'auto';
    return audio;
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  update() {
    // Only update if the game is not paused
    if (!this.isPaused) {
      this.player.update(this.keys);
      this.spawnEnemies();
      this.updateBullets();
      this.updateEnemies();
      this.updateScreamerBullets();
      this.checkCollisions();
      
      // Despawn XP orbs and health packs at stage 30
      if (this.stage === 30) {
        this.xpOrbs.forEach(orb => orb.destroy());
        this.xpOrbs = [];
      }
      
      this.updateXPOrbs();
      this.checkXPOrbCollections();
      this.updateNeutronStars();
      this.checkNeutronStarCollisions();
      this.updateRetepBullets();
      this.checkRetepBulletCollisions();
      this.updateHealthPacks();
      this.checkHealthPackCollections();
      this.spawnHealthPack();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.player.draw(this.ctx);
    this.enemies.forEach(enemy => enemy.draw(this.ctx));
  }

  spawnEnemies() {
    // If boss phase is active, no other enemies spawn
    if (this.isBossPhase) return;

    if (this.stage === 30 && !this.finalBoss) {
      this.startBossPhase();
      return;
    }

    // ...existing enemy spawning code...
    if (Math.random() < 0.02 && this.enemies.length < 10) {
      const angle = Math.random() * Math.PI * 2;
      const spawnDistance = Math.max(this.width, this.height);
      
      const spawnX = this.player.worldX + Math.cos(angle) * spawnDistance;
      const spawnY = this.player.worldY + Math.sin(angle) * spawnDistance;
      
      if (this.stage >= 30) return; // No spawns during boss phase

      if (this.stage >= 20 && Math.random() < 0.2) {
        this.enemies.push(new Scary(this, spawnX, spawnY));
      } else if (this.stage >= 10 && Math.random() < 0.10) { 
        this.enemies.push(new Freddy(this, spawnX, spawnY));
      } else if (this.stage >= 5 && Math.random() < 0.3) {
        this.enemies.push(new Shouter(this, spawnX, spawnY));
      } else {
        this.enemies.push(new Enemy(this, spawnX, spawnY));
      }
    }
  }

  startBossPhase() {
    this.isBossPhase = true;
    this.timerPaused = true;
    this.bossStartPauseTime = Date.now();
    
    // Clear all existing enemies
    this.enemies.forEach(enemy => enemy.destroy());
    this.enemies = [];

    // Spawn final boss
    const spawnX = this.player.worldX + this.width;
    const spawnY = this.player.worldY + this.height;
    
    this.finalBoss = new FinalBoss(this, spawnX, spawnY);
    this.enemies.push(this.finalBoss);

    // Create boss health bar
    this.createBossHealthBar();
  }

  createBossHealthBar() {
    const bossHealthBar = document.createElement('div');
    bossHealthBar.id = 'boss-health-bar';
    bossHealthBar.style.position = 'fixed';
    bossHealthBar.style.bottom = '10px';
    bossHealthBar.style.left = '10%';
    bossHealthBar.style.right = '10%';
    bossHealthBar.style.height = '30px';
    bossHealthBar.style.backgroundColor = 'rgba(50, 50, 50, 0.7)';
    bossHealthBar.style.borderRadius = '15px';
    bossHealthBar.style.overflow = 'hidden';

    const bossHealthFill = document.createElement('div');
    bossHealthFill.id = 'boss-health-fill';
    bossHealthFill.style.width = '100%';
    bossHealthFill.style.height = '100%';
    bossHealthFill.style.backgroundColor = 'red';
    bossHealthFill.style.transition = 'width 0.3s ease';

    bossHealthBar.appendChild(bossHealthFill);
    document.body.appendChild(bossHealthBar);
  }

  updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      bullet.update();
      return bullet.isActive;
    });
  }

  updateEnemies() {
    this.enemies = this.enemies.filter(enemy => {
      enemy.update();
      return enemy.isActive;
    });
  }

  updateScreamerBullets() {
    this.screamerBullets = this.screamerBullets.filter(bullet => {
      bullet.update();
      return bullet.isActive;
    });
  }

  checkCollisions() {
    this.bullets = this.bullets.filter(bullet => {
      if (this.finalBoss) {
        const hitBoss = this.checkCircleCollision(bullet, this.finalBoss);
        if (hitBoss) {
          this.finalBoss.health -= bullet.damage;
          
          if (this.finalBoss.updateBossHealthBar) {
            this.finalBoss.updateBossHealthBar();
          }
          
          if (this.finalBoss.health <= 0) {
            this.finalBoss.destroy();
            
            // Add victory screen when boss is first defeated
            if (!this.hasShownVictoryScreen) {
              this.showVictoryScreen();
              this.hasShownVictoryScreen = true;
            }
            
            this.finalBoss = null;
            this.isBossPhase = false;
            
            const bossHealthBar = document.getElementById('boss-health-bar');
            if (bossHealthBar) {
              bossHealthBar.remove();
            }
          }
          
          bullet.destroy();
          return false; 
        }
      }
      return true; 
    });

    this.enemies.forEach(enemy => {
      if (this.checkCircleCollision(this.player, enemy)) {
        if (!(enemy instanceof FinalBoss)) {
          this.player.takeDamage(1);
        }
      }
    });

    this.enemies = this.enemies.filter(enemy => {
      if (!enemy.isActive) {
        enemy.destroy();
        return false;
      }
      return true;
    });

    this.screamerBullets = this.screamerBullets.filter(bullet => {
      if (this.checkCircleCollision(this.player, bullet)) {
        this.player.takeDamage(1);
        bullet.destroy();
        return false;
      }
      return true;
    });

    this.bullets = this.bullets.filter(bullet => {
      const hitEnemy = this.enemies.some(enemy => {
        if (this.checkCircleCollision(bullet, enemy)) {
          enemy.health -= bullet.damage;
          
          // Immediately set enemy as inactive when hit
          if (enemy.health <= 0) {
            enemy.isActive = false;
            this.score += 1;
            this.kills += 1;
            
            enemy.dropXPOrb();
            
            // Remove enemy immediately
            enemy.destroy();
            
            document.getElementById('score').textContent = ` ${this.score}`;
            document.getElementById('kills').textContent = ` ${this.kills}`;
            
            if (this.updateScoreDisplay) {
              this.updateScoreDisplay(this.score);
            }
            
            if (this.updateKillsDisplay) {
              this.updateKillsDisplay(this.kills);
            }
          }
          return true; 
        }
        return false;
      });

      if (hitEnemy) {
        bullet.destroy(); 
        return false; 
      }
      return true; 
    });
  }

  checkCircleCollision(obj1, obj2) {
    const dx = obj1.worldX - obj2.worldX;
    const dy = obj1.worldY - obj2.worldY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius + obj2.radius);
  }

  start() {
    // Play "mne uze" song at start of game
    if (this.mneuzeSound) {
      this.mneuzeSound.play().catch(error => {
        console.warn('Could not play mne uze sound:', error);
      });
    }

    const gameLoop = () => {
      if (!this.gameOver) {
        this.update();
        this.draw();
        this.updateTimer();
        this.updateExperienceBar(); 
        requestAnimationFrame(gameLoop);
      } else {
        this.showGameOver();
      }
    };
    gameLoop();
  }

  showGameOver() {
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('final-score').textContent = this.score;
    document.getElementById('final-kills').textContent = this.kills;
    
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    document.getElementById('final-time').textContent = `${formattedMinutes}:${formattedSeconds}`;
    
    const scoreOverlay = document.getElementById('score-overlay');
    if (scoreOverlay) {
      scoreOverlay.style.display = 'none';
    }
    const stageOverlay = document.getElementById('stage-overlay');
    if (stageOverlay) {
      stageOverlay.style.display = 'none';
    }
  }

  updateExperienceBar() {
    const experienceBarFill = document.getElementById('experience-bar-fill');
    const experienceBarText = document.getElementById('experience-bar-text');
    if (experienceBarFill && experienceBarText) {
      const percentage = (this.experience / this.experienceToNextLevel) * 100;
      experienceBarFill.style.width = `${Math.min(percentage, 100)}%`;
      
      experienceBarText.textContent = `Lvl ${this.level} | ${Math.floor(this.experience)}/${this.experienceToNextLevel} XP`;
    }
  }

  updateXPOrbs() {
    this.xpOrbs = this.xpOrbs.filter(orb => {
      orb.update();
      return orb.isActive;
    });
  }

  checkXPOrbCollections() {
    this.xpOrbs = this.xpOrbs.filter(orb => {
      const dx = this.player.worldX - orb.worldX;
      const dy = this.player.worldY - orb.worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.player.radius + orb.radius) {
        this.experience += orb.value;
        
        while (this.experience >= this.experienceToNextLevel) {
          this.level++;
          this.experience -= this.experienceToNextLevel;
          this.experienceToNextLevel *= 1.45;  
          
          console.log(`Leveled up to ${this.level}! Next level requires ${this.experienceToNextLevel} XP`);
          
          // Show level up menu
          this.upgradeManager.showLevelUpMenu();
        }
        
        this.updateExperienceBar();
        
        orb.destroy();
        return false;
      }
      
      return true;
    });
  }

  updateNeutronStars() {
    this.neutronStars = this.neutronStars.filter(star => {
      star.update();
      return star.isActive;
    });
  }

  checkNeutronStarCollisions() {
    this.neutronStars.forEach(star => {
      if (this.checkCircleCollision(this.player, star)) {
        this.player.takeDamage(star.damage);
      }
    });
  }

  updateRetepBullets() {
    this.retepBullets = this.retepBullets.filter(bullet => {
      bullet.update();
      return bullet.isActive;
    });
  }

  checkRetepBulletCollisions() {
    this.retepBullets.forEach(bullet => {
      if (this.checkCircleCollision(this.player, bullet) && !this.player.isInvincible) {
        this.player.takeDamage(bullet.damage);
      }
    });
  }

  updateHealthPacks() {
    this.healthPacks = this.healthPacks.filter(healthPack => {
      healthPack.update();
      return healthPack.isActive;
    });
  }

  checkHealthPackCollections() {
    this.healthPacks = this.healthPacks.filter(healthPack => {
      const dx = this.player.worldX - healthPack.worldX;
      const dy = this.player.worldY - healthPack.worldY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.player.radius + healthPack.radius) {
        // Check if player needs healing
        if (this.player.health < this.player.maxHealth) {
          this.player.health++;
          this.player.updateHealthDisplay();
          
          // Play pickup sound
          healthPack.playPickupSound();
          
          healthPack.destroy();
          return false;
        }
      }
      
      return true;
    });
  }

  spawnHealthPack() {
    const currentTime = Date.now();
    if (currentTime - this.lastHealthPackSpawnTime >= this.healthPackSpawnInterval) {
      // Randomly decide whether to spawn a health pack (50% chance)
      if (Math.random() < 0.5) {
        const angle = Math.random() * Math.PI * 2;
        const spawnDistance = Math.max(this.width, this.height);
        
        const spawnX = this.player.worldX + Math.cos(angle) * spawnDistance;
        const spawnY = this.player.worldY + Math.sin(angle) * spawnDistance;
        
        this.healthPacks.push(new HealthPack(this, spawnX, spawnY));
        this.lastHealthPackSpawnTime = currentTime;
      }
    }
  }

  resumeTimer() {
    if (this.timerPaused) {
      this.pausedTime += Date.now() - this.bossStartPauseTime;
      this.timerPaused = false;
    }
  }

  showVictoryScreen() {
    // Create a full-screen overlay
    const victoryOverlay = document.createElement('div');
    victoryOverlay.style.position = 'fixed';
    victoryOverlay.style.top = '0';
    victoryOverlay.style.left = '0';
    victoryOverlay.style.width = '100%';
    victoryOverlay.style.height = '100%';
    victoryOverlay.style.backgroundColor = 'black';
    victoryOverlay.style.zIndex = '9999';
    victoryOverlay.style.display = 'flex';
    victoryOverlay.style.flexDirection = 'column';
    victoryOverlay.style.justifyContent = 'center';
    victoryOverlay.style.alignItems = 'center';

    // Create victory text
    const victoryText = document.createElement('h1');
    victoryText.textContent = 'Valio Laimejei';
    victoryText.style.color = 'white';
    victoryText.style.fontSize = '4rem';
    victoryText.style.marginBottom = '2rem';

    // Create image
    const victoryImage = document.createElement('img');
    victoryImage.src = 'kietas.jpg';
    victoryImage.style.maxWidth = '80%';
    victoryImage.style.maxHeight = '80%';
    victoryImage.style.objectFit = 'contain';

    // Add elements to overlay
    victoryOverlay.appendChild(victoryText);
    victoryOverlay.appendChild(victoryImage);

    // Add overlay to body
    document.body.appendChild(victoryOverlay);
  }

  pauseGame() {
    this.isPaused = true;
    this.timerPaused = true;
    this.pauseStartTime = Date.now();
  }

  resumeGame() {
    this.isPaused = false;
    this.timerPaused = false;
    
    // Adjust the pausedTime to account for the pause duration
    const pauseDuration = Date.now() - this.pauseStartTime;
    this.pausedTime += pauseDuration;
  }

  updateStageDisplay() {
    const stageOverlay = document.getElementById('stage-overlay');
    if (stageOverlay) {
      stageOverlay.textContent = `🏁 Stage ${this.stage}`;
      
      // Play Ave Maria when reaching stage 9
      if (this.stage === 9 && this.aveMariaSong) {
        this.aveMariaSong.play().catch(error => {
          console.warn('Could not play Ave Maria song:', error);
        });
      }
      
      // Play Dust song when reaching stage 15
      if (this.stage === 15 && this.dustSong) {
        this.dustSong.play().catch(error => {
          console.warn('Could not play Dust song:', error);
        });
      }
      
      // Play Bosanska song when reaching stage 22
      if (this.stage === 22 && this.bosanska) {
        this.bosanska.play().catch(error => {
          console.warn('Could not play Bosanska song:', error);
        });
      }
      
      // Play Gasa song when reaching stage 30
      if (this.stage === 30 && this.gasaSong) {
        this.gasaSong.play().catch(error => {
          console.warn('Could not play Gasa song:', error);
        });
      }
      
      // Update backgroundManager's stage
      if (this.backgroundManager) {
        this.backgroundManager.updateStage(this.stage);
      }
    }
  }
}

class Player {
  constructor(game) {
    this.game = game;
    this.x = game.width / 2;  
    this.y = game.height / 2; 
    this.width = 50;  
    this.height = 50;
    this.radius = 25;  
    this.speed = 0.4 * 3; 
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.isFacingRight = true;
    this.autoShootTimer = 0;
    this.autoShootInterval = Math.floor(300 * 0.7); 
    this.lastShootDirection = null;
    this.shootCooldown = 0;
    this.shootInterval = 300; 
    this.worldX = 0;  
    this.worldY = 0;
    this.scrollX = 0;
    this.scrollY = 0;
    this.sprite = this.createSprite();
    this.updateHealthDisplay();
    this.isInvincible = false;
    this.invincibilityTimer = 0;
    this.invincibilityDuration = 2000; 
    this.damageMultiplier = 1;
    this.multiShot = 1;
    this.multiShotAngle = 0;
  }

  createSprite() {
    const sprite = document.createElement('img');
    sprite.src = 'sigma.gif';
    sprite.id = 'player-sprite';
    sprite.style.position = 'absolute';
    document.body.appendChild(sprite);
    return sprite;
  }

  updateHealthDisplay() {
    const healthContainer = document.getElementById('health-container');
    
    // Ensure we have the correct number of heart elements
    while (healthContainer.children.length < this.maxHealth) {
      const newHeartElement = document.createElement('div');
      newHeartElement.classList.add('heart');
      newHeartElement.id = `heart${healthContainer.children.length + 1}`;
      
      const toiletImg = document.createElement('img');
      toiletImg.src = 'toilet.gif';
      newHeartElement.appendChild(toiletImg);
      
      healthContainer.appendChild(newHeartElement);
    }

    // Update visibility and style of hearts
    for (let i = 1; i <= this.maxHealth; i++) {
      const heartElement = document.getElementById(`heart${i}`);
      if (heartElement) {
        if (i <= this.health) {
          heartElement.classList.remove('lost');
          heartElement.querySelector('img').style.filter = 'none';
        } else {
          heartElement.classList.add('lost');
          heartElement.querySelector('img').style.filter = 'grayscale(100%) opacity(30%)';
        }
      }
    }
  }

  update(keys) {
    let dx = 0;
    let dy = 0;
    let shootDirection = null;

    this.autoShootTimer++;
    this.shootCooldown++;

    const sigmaSpeedMultiplier = this.game.sigmaSpeedMultiplier || 1;

    if (this.autoShootTimer >= this.autoShootInterval) {
      const baseDirection = this.lastShootDirection || { x: -1, y: 0 };

      for (let i = 0; i < this.multiShot; i++) {
        const angle = i * this.multiShotAngle - ((this.multiShot - 1) * this.multiShotAngle / 2);
        const rotatedDirection = this.rotateVector(baseDirection, angle);

        this.game.bullets.push(new Bullet(
          this.game, 
          this.x, 
          this.y, 
          this.worldX, 
          this.worldY, 
          rotatedDirection.x, 
          rotatedDirection.y
        ));
      }

      this.autoShootTimer = 0;
    }

    if (keys['KeyA']) {
      dx -= this.speed * sigmaSpeedMultiplier;
      this.isFacingRight = false;
      if (this.sprite) this.sprite.style.transform = 'scaleX(-1)';
      this.lastShootDirection = { x: 1, y: 0 }; 
    }
    if (keys['KeyD']) {
      dx += this.speed * sigmaSpeedMultiplier;
      this.isFacingRight = true;
      if (this.sprite) this.sprite.style.transform = 'scaleX(1)';
      this.lastShootDirection = { x: -1, y: 0 }; 
    }
    if (keys['KeyW']) {
      dy -= this.speed * sigmaSpeedMultiplier;
      this.lastShootDirection = { x: 0, y: 1 }; 
    }
    if (keys['KeyS']) {
      dy += this.speed * sigmaSpeedMultiplier;
      this.lastShootDirection = { x: 0, y: -1 }; 
    }

    this.worldX += dx;
    this.worldY += dy;

    const smoothingFactor = 0.1;
    this.scrollX += dx * smoothingFactor;
    this.scrollY += dy * smoothingFactor;

    if (this.sprite) {
      this.sprite.style.left = `${this.x - this.width/2}px`;
      this.sprite.style.top = `${this.y - this.height/2}px`;
    }

    this.updateHealthDisplay(); 

    if (this.isInvincible) {
      this.invincibilityTimer += 16; 
      
      if (this.sprite) {
        this.sprite.style.opacity = Math.floor(this.invincibilityTimer / 100) % 2 === 0 ? '1' : '0.5';
      }
      
      if (this.invincibilityTimer >= this.invincibilityDuration) {
        this.isInvincible = false;
        this.invincibilityTimer = 0;
        
        if (this.sprite) {
          this.sprite.style.opacity = '1';
        }
      }
    }
  }

  draw(ctx) {
    if (this.game.gameOver && this.sprite) {
      this.sprite.style.filter = 'grayscale(100%) brightness(50%)';
    }
  }

  takeDamage(amount) {
    if (!this.isInvincible) {
      const adjustedDamage = amount * this.damageMultiplier;
      this.health -= adjustedDamage; 
      
      this.isInvincible = true;
      this.invincibilityTimer = 0;
      
      if (this.health <= 0) {
        this.game.gameOver = true;
      }
    }
  }

  rotateVector(vector, angle) {
    return {
      x: vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
      y: vector.x * Math.sin(angle) + vector.y * Math.cos(angle)
    };
  }
}

class Bullet {
  constructor(game, x, y, worldX, worldY, directionX, directionY) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.worldX = worldX;
    this.worldY = worldY;
    this.radius = 5 * 1.2;  
    this.speed = 10 * 0.667;  
    this.damage = 100 * (game.bulletDamageMultiplier || 1);
    this.isActive = true;
    
    const length = Math.sqrt(directionX * directionX + directionY * directionY);
    this.directionX = length > 0 ? directionX / length : 0;
    this.directionY = length > 0 ? directionY / length : 0;
    
    this.bulletElement = this.createBulletElement();
  }

  createBulletElement() {
    const bulletElement = document.createElement('img');
    bulletElement.src = 'jonkbullet.png';
    bulletElement.classList.add('bullet');
    bulletElement.style.width = `${this.radius * 4}px`;
    bulletElement.style.height = `${this.radius * 4}px`;
    
    bulletElement.style.zIndex = '1000';
    
    const angle = Math.atan2(this.directionY, this.directionX) + Math.PI / 2;
    bulletElement.style.transform = `rotate(${angle}rad)`;
    
    document.getElementById('bullet-container').appendChild(bulletElement);
    return bulletElement;
  }

  update() {
    this.x += this.directionX * this.speed;
    this.y += this.directionY * this.speed;
    this.worldX += this.directionX * this.speed;
    this.worldY += this.directionY * this.speed;

    if (this.bulletElement) {
      this.bulletElement.style.left = `${this.x - this.radius * 2}px`;
      this.bulletElement.style.top = `${this.y - this.radius * 2}px`;
      this.bulletElement.style.zIndex = '1000';
      
      this.bulletElement.style.display = 'block';
    }

    if (this.x < 0 || this.x > this.game.width || 
        this.y < 0 || this.y > this.game.height) {
      this.isActive = false;
      if (this.bulletElement) {
        this.bulletElement.remove();
      }
    }
  }

  destroy() {
    if (this.bulletElement) {
      this.bulletElement.remove();
    }
    this.isActive = false;
  }

  draw(ctx) {
  }
}

class Enemy {
  constructor(game, x, y) {
    this.game = game;
    this.worldX = x;  
    this.worldY = y;
    this.x = x - this.game.player.worldX + this.game.width / 2;
    this.y = y - this.game.player.worldY + this.game.height / 2;
    this.radius = 30;
    this.speed = 0.5 * 2.2 * 0.8;  
    this.health = 300;
    this.isActive = true;
    this.sprite = this.createSprite();
    this.xpOrbValues = [50, 300, 1000, 5000, 100000];
    this.xpOrbImages = [
      'xp50.png', 
      'xp300.png', 
      'xp1000.png', 
      'xp5000.png', 
      'xp50000.png'
    ];
  }

  update() {
    const playerWorldX = this.game.player.worldX;
    const playerWorldY = this.game.player.worldY;

    const dx = playerWorldX - this.worldX;
    const dy = playerWorldY - this.worldY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let avoidanceX = 0;
    let avoidanceY = 0;

    this.game.enemies.forEach(otherEnemy => {
      if (otherEnemy !== this) {
        const enemyDx = this.worldX - otherEnemy.worldX;
        const enemyDy = this.worldY - otherEnemy.worldY;
        const enemyDistance = Math.sqrt(enemyDx * enemyDx + enemyDy * enemyDy);
        
        const minDistance = this.radius * 2;
        if (enemyDistance < minDistance) {
          const pushFactor = (minDistance - enemyDistance) / minDistance;
          avoidanceX += enemyDx * pushFactor * 0.1;
          avoidanceY += enemyDy * pushFactor * 0.1;
        }
      }
    });

    let moveRatio = this.speed;
    let directionX = distance > 0 ? dx / distance : 0;
    let directionY = distance > 0 ? dy / distance : 0;

    this.worldX += directionX * moveRatio + avoidanceX;
    this.worldY += directionY * moveRatio + avoidanceY;

    this.x = this.worldX - this.game.player.worldX + this.game.width / 2;
    this.y = this.worldY - this.game.player.worldY + this.game.height / 2;

    if (this.sprite) {
      this.sprite.style.left = `${this.x - this.radius}px`;
      this.sprite.style.top = `${this.y - this.radius}px`;
    }

    if (Math.abs(this.worldX - playerWorldX) > this.game.width * 2 || 
        Math.abs(this.worldY - playerWorldY) > this.game.height * 2) {
      this.isActive = false;
    }
  }

  createSprite() {
    const sprite = document.createElement('img');
    sprite.src = 'troll.png';
    sprite.classList.add('troll-enemy');
    sprite.style.position = 'absolute';
    document.body.appendChild(sprite);
    return sprite;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  destroy() {
    if (this.sprite) {
      this.sprite.remove();
    }
    this.isActive = false;
  }

  dropXPOrb() {
    const stage = this.game.stage;

    if (stage < 30) {
      // Stage 1-9: 1-3 50XP orbs
      const dropCount = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < dropCount; i++) {
        this.game.xpOrbs.push(new XPOrb(
          this.game, 
          this.worldX + Math.random() * 50 - 25, 
          this.worldY + Math.random() * 50 - 25, 
          50,
          'xp50.png'
        ));
      }
    }
  }
}

class Shouter extends Enemy {
  constructor(game, x, y) {
    super(game, x, y);  
    this.sprite = this.createSprite();
    this.radius = 40;
    this.speed = 0.5 * 2.2 * 0.8 * 0.5;  
    this.health = 1000;  
    this.shootTimer = 0;
    this.shootInterval = 180;  
  }

  createSprite() {
    const sprite = document.createElement('img');
    sprite.src = 'shouter.png';
    sprite.classList.add('shouter-enemy');
    sprite.style.position = 'absolute';
    sprite.style.width = `${this.radius * 2}px`;
    sprite.style.height = `${this.radius * 2}px`;
    document.body.appendChild(sprite);
    return sprite;
  }

  update() {
    const playerWorldX = this.game.player.worldX;
    const playerWorldY = this.game.player.worldY;

    const dx = playerWorldX - this.worldX;
    const dy = playerWorldY - this.worldY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let avoidanceX = 0;
    let avoidanceY = 0;

    this.game.enemies.forEach(otherEnemy => {
      if (otherEnemy !== this) {
        const enemyDx = this.worldX - otherEnemy.worldX;
        const enemyDy = this.worldY - otherEnemy.worldY;
        const enemyDistance = Math.sqrt(enemyDx * enemyDx + enemyDy * enemyDy);
        
        const minDistance = this.radius * 2;
        if (enemyDistance < minDistance) {
          const pushFactor = (minDistance - enemyDistance) / minDistance;
          avoidanceX += enemyDx * pushFactor * 0.1;
          avoidanceY += enemyDy * pushFactor * 0.1;
        }
      }
    });

    let moveRatio = this.speed;
    let directionX = distance > 0 ? dx / distance : 0;
    let directionY = distance > 0 ? dy / distance : 0;

    this.worldX += directionX * moveRatio + avoidanceX;
    this.worldY += directionY * moveRatio + avoidanceY;

    this.x = this.worldX - this.game.player.worldX + this.game.width / 2;
    this.y = this.worldY - this.game.player.worldY + this.game.height / 2;

    if (this.sprite) {
      this.sprite.style.left = `${this.x - this.radius}px`;
      this.sprite.style.top = `${this.y - this.radius}px`;
    }

    this.shootTimer++;
    if (this.shootTimer >= this.shootInterval) {
      this.shootAtPlayer();
      this.shootTimer = 0;
    }

    if (Math.abs(this.worldX - playerWorldX) > this.game.width * 2 || 
        Math.abs(this.worldY - playerWorldY) > this.game.height * 2) {
      this.isActive = false;
    }
  }

  shootAtPlayer() {
    const playerWorldX = this.game.player.worldX;
    const playerWorldY = this.game.player.worldY;

    this.game.screamerBullets.push(new ScreamerBullet(
      this.game, 
      this.x, 
      this.y, 
      this.worldX, 
      this.worldY, 
      playerWorldX,  
      playerWorldY
    ));
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  destroy() {
    if (this.sprite) {
      this.sprite.remove();
    }
    this.isActive = false;
  }

  dropXPOrb() {
    const stage = this.game.stage;

    if (stage >= 5 && stage < 20) {
      // Stage 10-19: 1-2 300XP orbs, 50% chance of 1 1000XP orb
      const drop300Count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < drop300Count; i++) {
        this.game.xpOrbs.push(new XPOrb(
          this.game, 
          this.worldX + Math.random() * 50 - 25, 
          this.worldY + Math.random() * 50 - 25, 
          300,
          'xp300.png'
        ));
      }

      if (Math.random() < 0.5) {
        this.game.xpOrbs.push(new XPOrb(
          this.game, 
          this.worldX, 
          this.worldY, 
          1000,
          'xp1000.png'
        ));
      }
    } else if (stage >= 20) {
      // Stage 20+: 1-3 1000XP orbs
      const drop1000Count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < drop1000Count; i++) {
        this.game.xpOrbs.push(new XPOrb(
          this.game, 
          this.worldX + Math.random() * 50 - 25, 
          this.worldY + Math.random() * 50 - 25, 
          1000,
          'xp1000.png'
        ));
      }
    }
  }
}

class Freddy extends Enemy {
  constructor(game, x, y) {
    super(game, x, y);  
    this.sprite = this.createSprite();
    this.radius = 80 * 0.85;  
    this.speed = 0.7 * 2.2 * 0.8 * 0.6 * 1.3 * 1.3 * 1.5;  
    this.health = 10000;  
  }

  createSprite() {
    const sprite = document.createElement('img');
    sprite.src = 'freddy.png';
    sprite.classList.add('freddy-enemy');
    sprite.style.position = 'absolute';
    
    sprite.style.width = `${this.radius * 4 / 0.85}px`;  
    sprite.style.height = `${this.radius * 4 / 0.85}px`;  
    sprite.style.objectFit = 'cover';
    sprite.style.objectPosition = 'center'; 
    
    document.body.appendChild(sprite);
    return sprite;
  }

  update() {
    const playerWorldX = this.game.player.worldX;
    const playerWorldY = this.game.player.worldY;

    const dx = playerWorldX - this.worldX;
    const dy = playerWorldY - this.worldY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let avoidanceX = 0;
    let avoidanceY = 0;

    this.game.enemies.forEach(otherEnemy => {
      if (otherEnemy !== this) {
        const enemyDx = this.worldX - otherEnemy.worldX;
        const enemyDy = this.worldY - otherEnemy.worldY;
        const enemyDistance = Math.sqrt(enemyDx * enemyDx + enemyDy * enemyDy);
        
        const minDistance = this.radius * 2;
        if (enemyDistance < minDistance) {
          const pushFactor = (minDistance - enemyDistance) / minDistance;
          avoidanceX += enemyDx * pushFactor * 0.1;
          avoidanceY += enemyDy * pushFactor * 0.1;
        }
      }
    });

    let moveRatio = this.speed;
    let directionX = distance > 0 ? dx / distance : 0;
    let directionY = distance > 0 ? dy / distance : 0;

    this.worldX += directionX * moveRatio + avoidanceX;
    this.worldY += directionY * moveRatio + avoidanceY;

    this.x = this.worldX - this.game.player.worldX + this.game.width / 2;
    this.y = this.worldY - this.game.player.worldY + this.game.height / 2;

    if (this.sprite) {
      this.sprite.style.left = `${this.x - this.radius}px`;
      this.sprite.style.top = `${this.y - this.radius}px`;
    }

    if (Math.abs(this.worldX - playerWorldX) > this.game.width * 2 || 
        Math.abs(this.worldY - playerWorldY) > this.game.height * 2) {
      this.isActive = false;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  destroy() {
    if (this.sprite) {
      this.sprite.remove();
    }
    this.isActive = false;
  }

  dropXPOrb() {
    const stage = this.game.stage;

    // Always drop 1 1000XP orb
    this.game.xpOrbs.push(new XPOrb(
      this.game, 
      this.worldX, 
      this.worldY, 
      1000,
      'xp1000.png'
    ));

    if (stage >= 20 && stage < 25) {
      // Stage 20-24: 40% chance of 1 5000XP orb
      if (Math.random() < 0.4) {
        this.game.xpOrbs.push(new XPOrb(
          this.game, 
          this.worldX + Math.random() * 50 - 25, 
          this.worldY + Math.random() * 50 - 25, 
          5000,
          'xp5000.png'
        ));
      }
    } else if (stage >= 25) {
      // Stage 25+: Always drop 2 5000XP orb
      this.game.xpOrbs.push(new XPOrb(
        this.game, 
        this.worldX + Math.random() * 50 - 25, 
        this.worldY + Math.random() * 50 - 25, 
        5000,
        'xp5000.png'
      ));
    }
  }
}

class Scary extends Enemy {
  constructor(game, x, y) {
    super(game, x, y);  
    this.sprite = this.createSprite();
    this.radius = 90;  
    this.speed = 0.6 * 2.2 * 0.8 * 0.7;  
    this.health = 5000;  
    this.neutronStarTimer = 0;
    this.neutronStarInterval = 3 * 60; 
  }

  createSprite() {
    const sprite = document.createElement('img');
    sprite.src = 'scary.png';
    sprite.classList.add('scary-enemy');
    sprite.style.position = 'absolute';
    sprite.style.width = `${this.radius * 3}px`;
    sprite.style.height = `${this.radius * 3}px`;
    document.body.appendChild(sprite);
    return sprite;
  }

  update() {
    super.update();

    this.neutronStarTimer++;
    if (this.neutronStarTimer >= this.neutronStarInterval) {
      this.expelNeutronStar();
      this.neutronStarTimer = 0;
    }
  }

  expelNeutronStar() {
    this.game.neutronStars.push(new NeutronStar(
      this.game, 
      this.worldX, 
      this.worldY
    ));
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  destroy() {
    if (this.sprite) {
      this.sprite.remove();
    }
    this.isActive = false;
  }

  dropXPOrb() {
    const stage = this.game.stage;

    if (stage >= 20) {
      // Stage 20+: 5 1000XP orbs
      for (let i = 0; i < 5; i++) {
        this.game.xpOrbs.push(new XPOrb(
          this.game, 
          this.worldX + Math.random() * 100 - 50, 
          this.worldY + Math.random() * 100 - 50, 
          1000,
          'xp1000.png'
        ));
      }

      // 20% chance of 1 50000XP orb
      if (Math.random() < 0.2) {
        this.game.xpOrbs.push(new XPOrb(
          this.game, 
          this.worldX, 
          this.worldY, 
          50000,
          'xp50000.png'
        ));
      }
    }
  }
}

class NeutronStar {
  constructor(game, x, y) {
    this.game = game;
    this.worldX = x;
    this.worldY = y;
    this.x = x - this.game.player.worldX + this.game.width / 2;
    this.y = y - this.game.player.worldY + this.game.height / 2;
    this.radius = 50;
    this.damage = 1;
    this.isActive = true;
    this.sprite = this.createSprite();
    this.creationTime = Date.now();
    this.lifetime = 5000; 
  }

  createSprite() {
    const sprite = document.createElement('img');
    sprite.src = 'neutron star.png';
    sprite.classList.add('neutron-star');
    sprite.style.position = 'absolute';
    sprite.style.width = `${this.radius * 5}px`;
    sprite.style.height = `${this.radius * 5}px`;
    sprite.style.opacity = '0.8';
    
    document.body.appendChild(sprite);
    return sprite;
  }

  update() {
    this.x = this.worldX - this.game.player.worldX + this.game.width / 2;
    this.y = this.worldY - this.game.player.worldY + this.game.height / 2;

    if (this.sprite) {
      this.sprite.style.left = `${this.x - this.radius}px`;
      this.sprite.style.top = `${this.y - this.radius}px`;
    }

    const currentTime = Date.now();
    if (currentTime - this.creationTime > this.lifetime) {
      this.destroy();
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.remove();
    }
    this.isActive = false;
  }
}

class FinalBoss extends Enemy {
  constructor(game, x, y) {
    super(game, x, y);
    this.sprite = this.createSprite();
    this.radius = 400 / 3;  
    this.speed = 2;   
    this.health = 400000;
    this.maxHealth = 400000;
    this.isBossSpawned = true;
    this.shouldCollideWithPlayer = false; 
    this.retepBulletTimer = 0;
    this.retepBulletInterval = 2 * 60; 
    this.teleportTimer = 0;
    this.teleportInterval = 4 * 60; 
  }

  createSprite() {
    const sprite = document.createElement('img');
    sprite.src = 'bigboss.gif';
    sprite.classList.add('final-boss');
    sprite.style.position = 'absolute';
    sprite.style.width = `${this.radius * 8}px`;
    sprite.style.height = `${this.radius * 8}px`;
    sprite.style.objectFit = 'cover';
    
    document.body.appendChild(sprite);
    return sprite;
  }

  update() {
    super.update();

    this.retepBulletTimer++;
    if (this.retepBulletTimer >= this.retepBulletInterval) {
      this.shootRetepBullets();
      this.retepBulletTimer = 0;
    }

    this.teleportTimer++;
    if (this.teleportTimer >= this.teleportInterval) {
      this.teleport();
      this.teleportTimer = 0;
    }
  }

  teleport() {
    const teleportRadius = 500; 
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * teleportRadius;

    const newWorldX = this.game.player.worldX + Math.cos(angle) * distance;
    const newWorldY = this.game.player.worldY + Math.sin(angle) * distance;

    this.worldX = newWorldX;
    this.worldY = newWorldY;

    this.x = this.worldX - this.game.player.worldX + this.game.width / 2;
    this.y = this.worldY - this.game.player.worldY + this.game.height / 2;

    if (this.sprite) {
      this.sprite.style.left = `${this.x - this.radius}px`;
      this.sprite.style.top = `${this.y - this.radius}px`;
    }
  }

  shootRetepBullets() {
    const bulletCount = 18;
    const angleIncrement = (Math.PI * 2) / bulletCount;

    for (let i = 0; i < bulletCount; i++) {
      const angle = i * angleIncrement;
      const directionX = Math.cos(angle);
      const directionY = Math.sin(angle);

      this.game.retepBullets.push(new RetepBullet(
        this.game, 
        this.worldX, 
        this.worldY, 
        directionX, 
        directionY
      ));
    }
  }

  updateBossHealthBar() {
    const bossHealthFill = document.getElementById('boss-health-fill');
    
    if (bossHealthFill) {
      const healthPercentage = (this.health / this.maxHealth) * 100;
      bossHealthFill.style.width = `${Math.max(healthPercentage, 0)}%`;
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.remove();
    }
    this.isActive = false;
    
    const bossHealthBar = document.getElementById('boss-health-bar');
    if (bossHealthBar) {
      bossHealthBar.remove();
    }

    if (this.game) {
      this.game.resumeTimer();
      this.game.isBossPhase = false;
    }
  }
}

class RetepBullet {
  constructor(game, x, y, directionX, directionY) {
    this.game = game;
    this.worldX = x;
    this.worldY = y;
    this.x = x - this.game.player.worldX + this.game.width / 2;
    this.y = y - this.game.player.worldY + this.game.height / 2;
    this.radius = 20;
    this.speed = 1.5;  
    this.damage = 1;
    this.isActive = true;
    this.directionX = directionX;
    this.directionY = directionY;
    this.creationTime = Date.now();
    this.lifetime = 10000;  
    this.bulletElement = this.createBulletElement();
  }

  createBulletElement() {
    const bulletElement = document.createElement('img');
    bulletElement.src = 'Retep.png';
    bulletElement.classList.add('retep-bullet');
    bulletElement.style.position = 'absolute';
    bulletElement.style.width = `${this.radius * 2}px`;
    bulletElement.style.height = `${this.radius * 2}px`;
    
    document.getElementById('bullet-container').appendChild(bulletElement);
    return bulletElement;
  }

  update() {
    this.worldX += this.directionX * this.speed;
    this.worldY += this.directionY * this.speed;

    this.x = this.worldX - this.game.player.worldX + this.game.width / 2;
    this.y = this.worldY - this.game.player.worldY + this.game.height / 2;

    if (this.bulletElement) {
      this.bulletElement.style.left = `${this.x - this.radius}px`;
      this.bulletElement.style.top = `${this.y - this.radius}px`;
    }

    const currentTime = Date.now();
    if (currentTime - this.creationTime > this.lifetime) {
      this.destroy();
    }
  }

  destroy() {
    if (this.bulletElement) {
      this.bulletElement.remove();
    }
    this.isActive = false;
  }
}

class HealthPack {
  constructor(game, x, y) {
    this.game = game;
    this.worldX = x;
    this.worldY = y;
    this.x = x - this.game.player.worldX + this.game.width / 2;
    this.y = y - this.game.player.worldY + this.game.height / 2;
    this.radius = 30;
    this.isActive = true;
    this.sprite = this.createSprite();
    this.creationTime = Date.now();
    this.nxSound = this.createSound(); 
  }

  createSound() {
    const audio = new Audio('nx.mp3');
    audio.volume = 0.5; 
    return audio;
  }

  createSprite() {
    const sprite = document.createElement('img');
    sprite.src = 'healthdrop.png';
    sprite.classList.add('health-pack');
    sprite.style.position = 'absolute';
    sprite.style.width = `${this.radius * 2}px`;
    sprite.style.height = `${this.radius * 2}px`;
    document.body.appendChild(sprite);
    return sprite;
  }

  update() {
    this.x = this.worldX - this.game.player.worldX + this.game.width / 2;
    this.y = this.worldY - this.game.player.worldY + this.game.height / 2;

    if (this.sprite) {
      this.sprite.style.left = `${this.x - this.radius}px`;
      this.sprite.style.top = `${this.y - this.radius}px`;
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.remove();
    }
    this.isActive = false;
  }

  playPickupSound() {
    if (this.nxSound) {
      this.nxSound.currentTime = 0; 
      this.nxSound.play();
    }
  }
}

class BackgroundManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;
    this.grassImages = [];
    this.spaceTileImages = []; 
    this.jonklerVideo = null;
    this.tileSize = 600 * (1 / 0.7); 
    this.zoomLevel = 0.7; 
    this.scrollX = 0;
    this.scrollY = 0;
    this.scrollSpeedMultiplier = 1; 
    this.randomSeed = Date.now();
    this.currentStage = 1; 
  }

  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  async loadImages() {
    const grassImageUrls = [
      'grass 1.png',
      'grass 2.png', 
      'grass 3.png', 
      'grass 4.png'
    ];

    const spaceImageUrls = [
      'spacetile 1.png',
      'spacetile 2.png', 
      'spacetile 3.png', 
      'spacetile 4.png',
      'spacetile 5.png'
    ];

    try {
      const grassLoadPromises = grassImageUrls.map(url => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Could not load image ${url}`));
          img.src = url;
        });
      });

      const spaceLoadPromises = spaceImageUrls.map(url => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Could not load image ${url}`));
          img.src = url;
        });
      });

      const jonklerVideoPromise = new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = 'jonkler.mp4';
        video.muted = true;
        video.loop = true;
        video.preload = 'auto';
        video.oncanplaythrough = () => {
          video.play();
          resolve(video);
        };
        video.onerror = () => reject(new Error('Could not load jonkler.mp4'));
      });

      this.grassImages = await Promise.all(grassLoadPromises);
      this.spaceTileImages = await Promise.all(spaceLoadPromises);
      this.jonklerVideo = await jonklerVideoPromise;
      return true;
    } catch (error) {
      console.error('Image/Video loading error:', error);
      return false;
    }
  }

  updateStage(stage) {
    this.currentStage = stage;
  }

  drawBackground(scrollX, scrollY) {
    let images = this.grassImages;
    
    if (this.currentStage >= 15 && this.currentStage < 30) {
      images = this.spaceTileImages;
    }

    this.scrollX = scrollX;
    this.scrollY = scrollY;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const tilesX = Math.ceil(this.width / (this.tileSize * this.zoomLevel)) + 6;
    const tilesY = Math.ceil(this.height / (this.tileSize * this.zoomLevel)) + 6;

    const offsetX = -Math.round(this.scrollX % this.tileSize);
    const offsetY = -Math.round(this.scrollY % this.tileSize);

    if (this.currentStage >= 30 && this.jonklerVideo) {
      for (let x = -3; x < tilesX; x++) {
        for (let y = -3; y < tilesY; y++) {
          this.ctx.drawImage(
            this.jonklerVideo, 
            x * this.tileSize * this.zoomLevel + offsetX, 
            y * this.tileSize * this.zoomLevel + offsetY, 
            this.tileSize * this.zoomLevel, 
            this.tileSize * this.zoomLevel
          );
        }
      }
    } else {
      for (let x = -3; x < tilesX; x++) {
        for (let y = -3; y < tilesY; y++) {
          const seedX = x + Math.floor(this.scrollX / this.tileSize);
          const seedY = y + Math.floor(this.scrollY / this.tileSize);
          const seed = this.randomSeed + (seedX + seedY * tilesX);
          
          const randomIndex = Math.floor(
            this.seededRandom(seed) * images.length
          );
          const randomImage = images[randomIndex];
          
          this.ctx.drawImage(
            randomImage, 
            x * this.tileSize * this.zoomLevel + offsetX, 
            y * this.tileSize * this.zoomLevel + offsetY, 
            this.tileSize * this.zoomLevel, 
            this.tileSize * this.zoomLevel
          );
        }
      }
    }
  }
}

class UpgradeManager {
  constructor(game) {
    this.game = game;
    this.upgradeTypes = [
      {
        name: 'Health',
        sprite: 'heart.png',
        description: 'Add an extra health point',
        effect: this.upgradeHealth.bind(this),
        currentLevel: 0,
        maxLevel: 5
      },
      {
        name: 'Speed',
        sprite: 'speed.png',
        description: 'Increase Sigma speed by 20%',
        effect: this.upgradeSpeed.bind(this),
        currentLevel: 0,
        maxLevel: 5
      },
      {
        name: 'JonkBullet Speed',
        sprite: 'bullet speed.png',
        description: 'Increase JonkBullet ejection speed by 10%',
        effect: this.upgradeJonkBulletSpeed.bind(this),
        currentLevel: 0,
        maxLevel: 5
      },
      {
        name: 'More JonkBullets',
        sprite: 'more bullet.png',
        description: 'Add an extra JonkBullet with 6° trajectory change',
        effect: this.upgradeJonkBulletCount.bind(this),
        currentLevel: 0,
        maxLevel: 5
      },
      {
        name: 'JonkBullet Damage',
        sprite: 'bullet damage.png',
        description: 'Increase JonkBullet damage by 50%',
        effect: this.upgradeJonkBulletDamage.bind(this),
        currentLevel: 0,
        maxLevel: 5
      }
    ];
    this.activeUpgradeOverlays = 0;
  }

  upgradeHealth() {
    if (this.game.player.maxHealth < 10) {
      this.game.player.maxHealth++;
      this.game.player.health = this.game.player.maxHealth;
      this.game.player.updateHealthDisplay();
    }
  }

  upgradeSpeed() {
    this.game.player.speed *= 1.1; 
    this.game.sigmaSpeedMultiplier *= 1.1; 
  }

  upgradeJonkBulletSpeed() {
    this.game.player.autoShootInterval *= 0.9; // 10% faster shooting
  }

  upgradeJonkBulletCount() {
    this.game.player.multiShot++;
    this.game.player.multiShotAngle = Math.PI / 30; // 6 degrees
  }

  upgradeJonkBulletDamage() {
    this.game.bulletDamageMultiplier *= 1.5; // 50% damage increase
  }

  showLevelUpMenu() {
    // Pause the game
    this.game.pauseGame();

    const levelUpOverlay = document.createElement('div');
    levelUpOverlay.style.position = 'fixed';
    levelUpOverlay.style.top = '0';
    levelUpOverlay.style.left = '0';
    levelUpOverlay.style.width = '100%';
    levelUpOverlay.style.height = '100%';
    levelUpOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    levelUpOverlay.style.display = 'flex';
    levelUpOverlay.style.flexDirection = 'column';
    levelUpOverlay.style.justifyContent = 'center';
    levelUpOverlay.style.alignItems = 'center';

    this.activeUpgradeOverlays++;

    // Create title
    const upgradeTitleContainer = document.createElement('div');
    upgradeTitleContainer.style.color = 'white';
    upgradeTitleContainer.style.fontSize = '2rem';
    upgradeTitleContainer.style.marginBottom = '20px';
    upgradeTitleContainer.textContent = 'Choose an Upgrade';

    // Create upgrade container
    const upgradeContainer = document.createElement('div');
    upgradeContainer.style.display = 'flex';
    upgradeContainer.style.gap = '20px';

    // Select 3 random upgrades
    const availableUpgrades = this.upgradeTypes.filter(upgrade => 
      upgrade.currentLevel < upgrade.maxLevel
    );
    const selectedUpgrades = [];

    for (let i = 0; i < 3 && availableUpgrades.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableUpgrades.length);
      const upgrade = availableUpgrades[randomIndex];
      selectedUpgrades.push(upgrade);
      availableUpgrades.splice(randomIndex, 1);
    }

    selectedUpgrades.forEach(upgrade => {
      const upgradeElement = document.createElement('div');
      upgradeElement.style.width = '200px';
      upgradeElement.style.height = '250px';
      upgradeElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      upgradeElement.style.border = '2px solid #64ffda';
      upgradeElement.style.borderRadius = '10px';
      upgradeElement.style.display = 'flex';
      upgradeElement.style.flexDirection = 'column';
      upgradeElement.style.alignItems = 'center';
      upgradeElement.style.justifyContent = 'center';
      upgradeElement.style.padding = '15px';
      upgradeElement.style.cursor = 'pointer';
      upgradeElement.style.transition = 'transform 0.2s ease';

      const upgradeImage = document.createElement('img');
      upgradeImage.src = upgrade.sprite;
      upgradeImage.style.width = '100px';
      upgradeImage.style.height = '100px';
      upgradeImage.style.marginBottom = '15px';

      const upgradeName = document.createElement('h3');
      upgradeName.textContent = upgrade.name;
      upgradeName.style.color = 'white';
      upgradeName.style.marginBottom = '10px';

      const upgradeDescription = document.createElement('p');
      upgradeDescription.textContent = upgrade.description;
      upgradeDescription.style.color = '#64ffda';
      upgradeDescription.style.textAlign = 'center';
      upgradeDescription.style.fontSize = '0.9rem';

      upgradeElement.appendChild(upgradeImage);
      upgradeElement.appendChild(upgradeName);
      upgradeElement.appendChild(upgradeDescription);

      upgradeElement.addEventListener('mouseenter', () => {
        upgradeElement.style.transform = 'scale(1.05)';
      });

      upgradeElement.addEventListener('mouseleave', () => {
        upgradeElement.style.transform = 'scale(1)';
      });

      upgradeElement.addEventListener('click', () => {
        upgrade.effect();
        upgrade.currentLevel++;
        levelUpOverlay.remove();
        
        this.activeUpgradeOverlays--;
        
        // Resume the game only if no other upgrade menus are open
        if (this.activeUpgradeOverlays === 0) {
          this.game.resumeGame();
        }
      });

      upgradeContainer.appendChild(upgradeElement);
    });

    levelUpOverlay.appendChild(upgradeTitleContainer);
    levelUpOverlay.appendChild(upgradeContainer);
    document.body.appendChild(levelUpOverlay);
  }
}

class XPOrb {
  constructor(game, x, y, value, imageSrc) {
    this.game = game;
    this.worldX = x;  
    this.worldY = y;
    this.x = x - this.game.player.worldX + this.game.width / 2;
    this.y = y - this.game.player.worldY + this.game.height / 2;
    this.radius = 20;
    this.value = value;
    this.isActive = true;
    this.sprite = this.createSprite(imageSrc);
  }

  createSprite(imageSrc) {
    const sprite = document.createElement('img');
    sprite.src = imageSrc;
    sprite.classList.add('xp-orb');
    sprite.style.position = 'absolute';
    sprite.style.width = `${this.radius * 2}px`;
    sprite.style.height = `${this.radius * 2}px`;
    document.body.appendChild(sprite);
    return sprite;
  }

  update() {
    this.x = this.worldX - this.game.player.worldX + this.game.width / 2;
    this.y = this.worldY - this.game.player.worldY + this.game.height / 2;

    if (this.sprite) {
      this.sprite.style.left = `${this.x - this.radius}px`;
      this.sprite.style.top = `${this.y - this.radius}px`;
    }
  }

  destroy() {
    if (this.sprite) {
      this.sprite.remove();
    }
    this.isActive = false;
  }
}

class ScreamerBullet {
  constructor(game, x, y, worldX, worldY, targetWorldX, targetWorldY) {
    this.game = game;
    this.worldX = worldX;
    this.worldY = worldY;
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.damage = 1; 
    this.speed = 5 / 3;  
    this.isActive = true;
    
    const dx = targetWorldX - worldX;
    const dy = targetWorldY - worldY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.directionX = distance > 0 ? dx / distance : 0;
    this.directionY = distance > 0 ? dy / distance : 0;
    
    this.bulletElement = this.createBulletElement();
  }

  createBulletElement() {
    const bulletElement = document.createElement('img');
    bulletElement.src = 'screamer.png';
    bulletElement.classList.add('screamer-bullet');
    bulletElement.style.position = 'absolute';
    bulletElement.style.width = `${this.radius * 2}px`;
    bulletElement.style.height = `${this.radius * 2}px`;
    
    document.getElementById('bullet-container').appendChild(bulletElement);
    return bulletElement;
  }

  update() {
    this.worldX += this.directionX * this.speed;
    this.worldY += this.directionY * this.speed;

    this.x = this.worldX - this.game.player.worldX + this.game.width / 2;
    this.y = this.worldY - this.game.player.worldY + this.game.height / 2;

    if (this.bulletElement) {
      this.bulletElement.style.left = `${this.x - this.radius}px`;
      this.bulletElement.style.top = `${this.y - this.radius}px`;
    }

    if (this.x < -100 || this.x > this.game.width + 100 || 
        this.y < -100 || this.y > this.game.height + 100) {
      this.destroy();
    }
  }

  destroy() {
    if (this.bulletElement) {
      this.bulletElement.remove();
    }
    this.isActive = false;
  }
}