export function generateChaosSwarm(imageCount = 300) {
  const container = document.getElementById('image-container');
  const killCounterEl = document.getElementById('kill-counter');
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let backgroundMusic = null;
  let totalShotCount = 0;
  let killedNxCount = 0;
  let killedImage1Count = 0;
  let currentImageType = 'nx';
  let isMouseDown = false;

  // New image spawning phases
  const imageSpawnPhases = [
    { threshold: 300, image: '/scary.jpg' },
    { threshold: 400, image: '/bobo.png' },
    { threshold: 500, image: '/ggg.png' },
    { threshold: 600, image: '/aaa.png' },
    { threshold: 700, image: '/vaav.png' },
    { threshold: 800, image: '/smg.webp' },
    { threshold: 900, image: '/durn.jpg' }
  ];

  let currentPhaseIndex = 0;

  function updateKillCounter() {
    killCounterEl.textContent = `Kills: ${totalShotCount}`;

    // Check if we need to switch to a new image type
    if (currentPhaseIndex < imageSpawnPhases.length) {
      const currentPhase = imageSpawnPhases[currentPhaseIndex];
      if (totalShotCount >= currentPhase.threshold) {
        currentImageType = currentPhase.image.split('/').pop().split('.')[0];
        currentPhaseIndex++;
      }
    }

    // Check for video transition
    if (totalShotCount >= 1000) {
      stopAllSounds();
      setupVideoTransition();
    }
  }

  function stopAllSounds() {
    // Stop background music
    if (backgroundMusic) {
      backgroundMusic.stop();
      backgroundMusic = null;
    }

    // Attempt to stop all audio sources in the audio context
    audioContext.close();
  }

  function startBackgroundMusic(musicFile) {
    if (backgroundMusic) {
      backgroundMusic.stop();
    }

    fetch(musicFile)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        backgroundMusic = audioContext.createBufferSource();
        backgroundMusic.buffer = audioBuffer;
        backgroundMusic.loop = true;
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.3; // Lower volume for background
        
        backgroundMusic.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        backgroundMusic.start();
      });
  }

  function createExplosionSound() {
    return new Promise((resolve, reject) => {
      fetch('/explosion.mp3')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          
          const gainNode = audioContext.createGain();
          gainNode.gain.value = Math.random() * 0.5 + 0.5; // Varied volume
          
          source.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          source.start();
          resolve();
        })
        .catch(reject);
    });
  }

  function createExplosion(img, spawnNew = true) {
    const explosion = document.createElement('img');
    explosion.src = '/exp.gif';
    explosion.classList.add('explosion');
    explosion.style.left = `${parseFloat(img.style.left) + img.width/2}px`;
    explosion.style.top = `${parseFloat(img.style.top) + img.height/2}px`;
    
    container.appendChild(explosion);
    
    createExplosionSound();
    
    // Remove explosion and image
    img.remove();
    
    // Slight delay to show explosion
    setTimeout(() => {
      explosion.remove();
      
      // Spawn a new image to replace the destroyed one if specified
      if (spawnNew) {
        createChaosImage();
      }
    }, 500);
  }

  function createMassExplosion(imagesToDestroy = [], spawnNew = true) {
    const explosionPromises = imagesToDestroy.map(img => {
      return new Promise((resolve) => {
        const explosion = document.createElement('img');
        explosion.src = '/exp.gif';
        explosion.classList.add('explosion');
        explosion.style.left = `${parseFloat(img.style.left) + img.width/2}px`;
        explosion.style.top = `${parseFloat(img.style.top) + img.height/2}px`;
        
        container.appendChild(explosion);
        
        createExplosionSound();
        
        img.remove();
        
        setTimeout(() => {
          explosion.remove();
          resolve();
        }, 500);
      });
    });

    // If spawn new is true, replace destroyed images
    Promise.all(explosionPromises).then(() => {
      if (spawnNew) {
        while (imagesToDestroy.length > 0) {
          createChaosImage();
          imagesToDestroy.pop();
        }
      }
    });
  }

  function selectClosestImages(count) {
    const images = document.querySelectorAll('.nx-image');
    const sortedImages = Array.from(images)
      .sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        const aDistance = Math.sqrt(
          Math.pow(aRect.left - window.innerWidth/2, 2) + 
          Math.pow(aRect.top - window.innerHeight/2, 2)
        );
        const bDistance = Math.sqrt(
          Math.pow(bRect.left - window.innerWidth/2, 2) + 
          Math.pow(bRect.top - window.innerHeight/2, 2)
        );
        return aDistance - bDistance;
      });

    return sortedImages.slice(0, count);
  }

  function createChaosImage() {
    const img = document.createElement('img');
    
    // Determine image source based on current phase
    if (currentPhaseIndex === 0) {
      img.src = currentImageType === 'nx' ? '/nx.png' : '/image1.png';
    } else {
      const currentPhase = imageSpawnPhases[currentPhaseIndex - 1];
      img.src = currentPhase.image;
    }

    img.classList.add('nx-image');
    
    // Rest of the existing createChaosImage logic...
    img.style.left = `${Math.random() * window.innerWidth}px`;
    img.style.top = `${Math.random() * window.innerHeight}px`;
    
    const size = Math.random() * 100 + 20;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    
    img.addEventListener('click', () => {
      handleImageDestruction(img);
    });
    
    container.appendChild(img);
    
    // Existing movement logic
    const movementType = Math.random();
    if (movementType < 0.3) {
      animateRandomChaoticMovement(img);
    } else if (movementType < 0.6) {
      animateCrossScreenMovement(img);
    } else {
      animateBounceMovement(img);
    }
    
    playRandomSound(audioContext);
  }

  function handleImageDestruction(img) {
    totalShotCount++;
    updateKillCounter();
    
    // Track killed images based on current type
    if (currentImageType === 'nx') {
      killedNxCount++;
    } else {
      killedImage1Count++;
    }

    // Check for image type switch
    if (currentImageType === 'nx' && killedNxCount >= 100) {
      currentImageType = 'image1';
      killedNxCount = 0;
      startBackgroundMusic('/Gimtadieno daina.mp3');
    } else if (currentImageType === 'image1' && killedImage1Count >= 100) {
      currentImageType = 'nx';
      killedImage1Count = 0;
      startBackgroundMusic('/nx.mp3');
    }
    
    // Existing explosion logic
    if (totalShotCount % 3 === 0) {
      const closestImages = selectClosestImages(10);
      createMassExplosion(closestImages);
    } 
    else if (totalShotCount % 10 === 0) {
      const closestImages = selectClosestImages(20);
      createMassExplosion(closestImages);
    } 
    else if (totalShotCount % 50 === 0) {
      const allImages = document.querySelectorAll('.nx-image');
      createMassExplosion(Array.from(allImages), false);
    }
    else {
      createExplosion(img);
    }
  }

  function animateRandomChaoticMovement(img) {
    function updatePosition() {
      const speedX = (Math.random() - 0.5) * 20;
      const speedY = (Math.random() - 0.5) * 20;
      
      const currentLeft = parseFloat(img.style.left);
      const currentTop = parseFloat(img.style.top);
      
      let newLeft = currentLeft + speedX;
      let newTop = currentTop + speedY;
      
      // Wrap around screen
      newLeft = (newLeft + window.innerWidth) % window.innerWidth;
      newTop = (newTop + window.innerHeight) % window.innerHeight;
      
      img.style.left = `${newLeft}px`;
      img.style.top = `${newTop}px`;
      
      // Randomly decide whether to rotate
      if (Math.random() < 0.5) {
        img.style.transform = `rotate(${Math.random() * 360}deg)`;
      }
      
      requestAnimationFrame(updatePosition);
    }
    
    updatePosition();
  }

  function animateCrossScreenMovement(img) {
    let posX = Math.random() * window.innerWidth;
    let posY = Math.random() * window.innerHeight;
    let speedX = (Math.random() - 0.5) * 10;
    let speedY = (Math.random() - 0.5) * 10;

    function updatePosition() {
      posX += speedX;
      posY += speedY;

      // Wrap around screen
      if (posX < 0) posX = window.innerWidth;
      if (posX > window.innerWidth) posX = 0;
      if (posY < 0) posY = window.innerHeight;
      if (posY > window.innerHeight) posY = 0;

      img.style.left = `${posX}px`;
      img.style.top = `${posY}px`;

      requestAnimationFrame(updatePosition);
    }

    updatePosition();
  }

  function animateBounceMovement(img) {
    let posX = Math.random() * window.innerWidth;
    let posY = Math.random() * window.innerHeight;
    let speedX = (Math.random() - 0.5) * 10;
    let speedY = (Math.random() - 0.5) * 10;

    function updatePosition() {
      posX += speedX;
      posY += speedY;

      // Bounce off edges
      if (posX < 0 || posX > window.innerWidth - img.width) {
        speedX = -speedX;
      }
      if (posY < 0 || posY > window.innerHeight - img.height) {
        speedY = -speedY;
      }

      img.style.left = `${posX}px`;
      img.style.top = `${posY}px`;

      requestAnimationFrame(updatePosition);
    }

    updatePosition();
  }

  function playRandomSound(audioContext) {
    fetch('/nx.mp3')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Randomize pitch and volume
        source.playbackRate.value = Math.random() * 2 + 0.5; // 0.5 to 2.5x speed
        
        const gainNode = audioContext.createGain();
        gainNode.gain.value = Math.random() * 0.2; // Lower volume for random sounds
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.start();
      });
  }

  function setupMouseHoverExplosion() {
    container.addEventListener('mousedown', () => {
      isMouseDown = true;
    });

    container.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    container.addEventListener('mousemove', (event) => {
      if (isMouseDown) {
        const images = document.querySelectorAll('.nx-image');
        images.forEach(img => {
          const imgRect = img.getBoundingClientRect();
          if (
            event.clientX >= imgRect.left && 
            event.clientX <= imgRect.right && 
            event.clientY >= imgRect.top && 
            event.clientY <= imgRect.bottom
          ) {
            handleImageDestruction(img);
          }
        });
      }
    });
  }

  function setupVideoTransition() {
    const videoOverlay = document.getElementById('video-overlay');
    const playButton = document.getElementById('play-button');
    const video = document.getElementById('mister-robot-video');

    function fadeOutChaos() {
      const images = document.querySelectorAll('.nx-image');
      const container = document.getElementById('image-container');
      const killCounter = document.getElementById('kill-counter');

      images.forEach(img => {
        img.style.transition = 'opacity 2s ease';
        img.style.opacity = '0';
      });

      container.style.transition = 'opacity 2s ease';
      container.style.opacity = '0';
      
      killCounter.style.transition = 'opacity 2s ease';
      killCounter.style.opacity = '0';

      setTimeout(() => {
        videoOverlay.classList.remove('hidden');
        videoOverlay.classList.add('visible');
        
        setTimeout(() => {
          playButton.classList.add('visible');
        }, 2000);
      }, 2000);
    }

    function startVideo() {
      videoOverlay.classList.add('playing');
      video.play();

      video.onended = () => {
        window.location.href = 'https://lt.wikipedia.org/wiki/%C5%A0iauliai';
      };
    }

    playButton.addEventListener('click', startVideo);

    // Trigger fade out at 1000 kills
    fadeOutChaos();
  }

  function generateChaosSwarmWithMouseExplosion() {
    // Start background music initially
    startBackgroundMusic('/nx.mp3');

    // Setup mouse hover explosion
    setupMouseHoverExplosion();

    // Create multiple chaotic images
    for (let i = 0; i < imageCount; i++) {
      createChaosImage();
    }
  }

  // Replace the original generation call
  generateChaosSwarmWithMouseExplosion();
}