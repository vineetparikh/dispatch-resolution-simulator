import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Plus, Minus, X, Settings, ChevronDown, ChevronUp } from 'lucide-react';

const App = () => {
  const [attributes, setAttributes] = useState([
    { name: 'Stealth', playerValue: 70, taskValue: 50, autoFail: null, bonus: null },
    { name: 'Combat', playerValue: 80, taskValue: 60, autoFail: null, bonus: null },
    { name: 'Tech', playerValue: 60, taskValue: 70, autoFail: null, bonus: null },
    { name: 'Social', playerValue: 75, taskValue: 55, autoFail: null, bonus: null },
    { name: 'Perception', playerValue: 85, taskValue: 65, autoFail: null, bonus: null }
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  const [result, setResult] = useState(null);
  const [overlapPercent, setOverlapPercent] = useState(0);
  const [ballPhysics, setBallPhysics] = useState({
    speed: 8,
    friction: 0.98,
    maxBounces: 15,
    randomness: 0.5
  });
  const [showPhysicsPanel, setShowPhysicsPanel] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showRationale, setShowRationale] = useState(false);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    calculateOverlap();
    drawShapes();
  }, [attributes, ballPos]);

  const getPolygonPoints = (isPlayer, centerX, centerY, maxRadius) => {
    const points = [];
    const angleStep = (Math.PI * 2) / attributes.length;

    for (let i = 0; i < attributes.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const value = isPlayer ? attributes[i].playerValue : attributes[i].taskValue;
      const radius = (value / 100) * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      points.push({ x, y });
    }

    return points;
  };

  const pointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;

      const intersect = ((yi > point.y) !== (yj > point.y))
        && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const calculateOverlap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 40;

    const playerPoints = getPolygonPoints(true, centerX, centerY, maxRadius);
    const taskPoints = getPolygonPoints(false, centerX, centerY, maxRadius);

    let overlapCount = 0;
    let totalCount = 0;
    const step = 5;

    for (let x = centerX - maxRadius; x <= centerX + maxRadius; x += step) {
      for (let y = centerY - maxRadius; y <= centerY + maxRadius; y += step) {
        const point = { x, y };
        const inTask = pointInPolygon(point, taskPoints);
        if (inTask) {
          totalCount++;
          if (pointInPolygon(point, playerPoints)) {
            overlapCount++;
          }
        }
      }
    }

    const percent = totalCount > 0 ? Math.round((overlapCount / totalCount) * 100) : 0;
    setOverlapPercent(percent);
  };

  const drawShapes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 40;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      const radius = (i / 4) * maxRadius;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw attribute axes
    const angleStep = (Math.PI * 2) / attributes.length;
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;

    for (let i = 0; i < attributes.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * maxRadius,
        centerY + Math.sin(angle) * maxRadius
      );
      ctx.stroke();

      // Draw attribute labels
      const labelRadius = maxRadius + 20;
      const labelX = centerX + Math.cos(angle) * labelRadius;
      const labelY = centerY + Math.sin(angle) * labelRadius;
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(attributes[i].name, labelX, labelY);

      // Draw auto-fail marker
      if (attributes[i].autoFail !== null) {
        const afRadius = (attributes[i].autoFail / 100) * maxRadius;
        const afX = centerX + Math.cos(angle) * afRadius;
        const afY = centerY + Math.sin(angle) * afRadius;
        ctx.beginPath();
        ctx.arc(afX, afY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#dc2626';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw bonus marker
      if (attributes[i].bonus !== null) {
        const bonusRadius = (attributes[i].bonus / 100) * maxRadius;
        const bonusX = centerX + Math.cos(angle) * bonusRadius;
        const bonusY = centerY + Math.sin(angle) * bonusRadius;
        ctx.beginPath();
        ctx.arc(bonusX, bonusY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#16a34a';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Draw task difficulty polygon
    const taskPoints = getPolygonPoints(false, centerX, centerY, maxRadius);
    ctx.beginPath();
    ctx.moveTo(taskPoints[0].x, taskPoints[0].y);
    for (let i = 1; i < taskPoints.length; i++) {
      ctx.lineTo(taskPoints[i].x, taskPoints[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw player stats polygon
    const playerPoints = getPolygonPoints(true, centerX, centerY, maxRadius);
    ctx.beginPath();
    ctx.moveTo(playerPoints[0].x, playerPoints[0].y);
    for (let i = 1; i < playerPoints.length; i++) {
      ctx.lineTo(playerPoints[i].x, playerPoints[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw ball if animating or result shown
    if (ballPos.x !== 0 || ballPos.y !== 0) {
      ctx.beginPath();
      ctx.arc(centerX + ballPos.x, centerY + ballPos.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = result === 'success' ? '#10b981' : result === 'bonus' ? '#16a34a' : result === 'failure' ? '#ef4444' : '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const runResolution = () => {
    setIsAnimating(true);
    setResult(null);

    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 40;

    // Check for auto-fails first - triggers if PLAYER stat is at or above threshold
    const angleStep = (Math.PI * 2) / attributes.length;
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      // Auto-fail triggers if PLAYER VALUE is AT OR ABOVE the threshold
      if (attr.autoFail !== null && attr.playerValue >= attr.autoFail) {
        // Auto-fail triggered - place ball at the auto-fail point and stop
        const angle = i * angleStep - Math.PI / 2;
        const radius = (attr.autoFail / 100) * maxRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Use setTimeout to ensure state updates properly
        setTimeout(() => {
          setBallPos({ x, y });
          setResult('failure');
          setIsAnimating(false);
        }, 0);
        return;
      }
    }

    // Random angle for bouncing
    const angle = Math.random() * Math.PI * 2;
    const speed = ballPhysics.speed;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    let x = 0;
    let y = 0;

    const taskPoints = getPolygonPoints(false, centerX, centerY, maxRadius);
    const playerPoints = getPolygonPoints(true, centerX, centerY, maxRadius);

    let bounces = 0;
    const maxBounces = ballPhysics.maxBounces;

    const animate = () => {
      x += vx;
      y += vy;

      // Apply friction
      vx *= ballPhysics.friction;
      vy *= ballPhysics.friction;

      // Check if outside task boundary
      const currentPoint = { x: centerX + x, y: centerY + y };
      const inTask = pointInPolygon(currentPoint, taskPoints);

      if (!inTask && bounces < maxBounces) {
        // Bounce back toward center - maintain current speed, just change direction
        const currentSpeed = Math.sqrt(vx * vx + vy * vy);
        const angleToCenter = Math.atan2(-y, -x);
        const randomness = (Math.random() - 0.5) * ballPhysics.randomness;
        vx = Math.cos(angleToCenter + randomness) * currentSpeed * 0.9;
        vy = Math.sin(angleToCenter + randomness) * currentSpeed * 0.9;
        bounces++;
      } else if (!inTask || bounces >= maxBounces) {
        // Settle - check for bonus
        const finalInPlayer = pointInPolygon(currentPoint, playerPoints);
        if (finalInPlayer) {
          // Check if ANY player stat meets bonus threshold
          let hasBonus = false;
          for (let i = 0; i < attributes.length; i++) {
            if (attributes[i].bonus !== null && attributes[i].playerValue >= attributes[i].bonus) {
              hasBonus = true;
              break;
            }
          }
          setResult(hasBonus ? 'bonus' : 'success');
        } else {
          setResult('failure');
        }
        setIsAnimating(false);
        return;
      }

      setBallPos({ x, y });

      if (Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Final settlement - check for bonus
        const finalInPlayer = pointInPolygon(currentPoint, playerPoints);
        if (finalInPlayer) {
          // Check if ANY player stat meets bonus threshold
          let hasBonus = false;
          for (let i = 0; i < attributes.length; i++) {
            if (attributes[i].bonus !== null && attributes[i].playerValue >= attributes[i].bonus) {
              hasBonus = true;
              break;
            }
          }
          setResult(hasBonus ? 'bonus' : 'success');
        } else {
          setResult('failure');
        }
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const reset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
    setBallPos({ x: 0, y: 0 });
    setResult(null);
  };

  const updatePlayerStat = (index, value) => {
    const newAttributes = [...attributes];
    newAttributes[index].playerValue = Math.max(0, Math.min(100, value));
    setAttributes(newAttributes);
  };

  const updateTaskDifficulty = (index, value) => {
    const newAttributes = [...attributes];
    newAttributes[index].taskValue = Math.max(0, Math.min(100, value));
    setAttributes(newAttributes);
  };

  const updateAttributeName = (index, name) => {
    const newAttributes = [...attributes];
    newAttributes[index].name = name;
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: `Attribute ${attributes.length + 1}`, playerValue: 50, taskValue: 50, autoFail: null, bonus: null }]);
  };

  const removeAttribute = (index) => {
    if (attributes.length > 3) {
      setAttributes(attributes.filter((_, i) => i !== index));
    }
  };

  const updatePhysics = (key, value) => {
    setBallPhysics({ ...ballPhysics, [key]: value });
  };

  const updateAutoFail = (index, value) => {
    const newAttributes = [...attributes];
    newAttributes[index].autoFail = value === '' ? null : Math.max(0, Math.min(100, parseInt(value) || 0));
    setAttributes(newAttributes);
  };

  const updateBonus = (index, value) => {
    const newAttributes = [...attributes];
    newAttributes[index].bonus = value === '' ? null : Math.max(0, Math.min(100, parseInt(value) || 0));
    setAttributes(newAttributes);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dispatch Resolution Mechanic</h1>
          <p className="text-slate-600 mb-4">
            Blue = Player abilities, Red = Task difficulty. The ball bounces within the task area until it settles.
          </p>

          {/* How to Use Dropdown */}
          <div className="mb-4 border border-slate-200 rounded-lg">
            <button
              onClick={() => setShowHowToUse(!showHowToUse)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold text-slate-700">How to Use</span>
              {showHowToUse ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showHowToUse && (
              <div className="p-4 pt-0 text-slate-600 text-sm space-y-2">
                <p><strong>Setting up attributes:</strong> Add or remove attributes using the "Add" button. Name each attribute to match your game's needs (e.g., Stealth, Combat, Tech).</p>
                <p><strong>Adjusting values:</strong> Use the sliders to set player stats (blue) and task difficulty (red). The overlap percentage shows your base success chance.</p>
                <p><strong>Auto-Fail thresholds:</strong> Set these in the Player Stats panel. If a player's stat reaches this value, the task automatically fails - representing situations where being "too good" at something causes problems.</p>
                <p><strong>Bonus thresholds:</strong> Also in Player Stats. If the player meets or exceeds this value and succeeds, they get a bonus success.</p>
                <p><strong>Ball Physics:</strong> Click the Physics button to adjust how the ball behaves - speed, friction, bounce count, and randomness all affect the resolution.</p>
                <p><strong>Running resolution:</strong> Click "Run Resolution" to see the outcome. The ball bounces within the task boundary and where it lands determines success or failure.</p>
              </div>
            )}
          </div>

          {/* Why I Made This Dropdown */}
          <div className="mb-4 border border-slate-200 rounded-lg">
            <button
              onClick={() => setShowRationale(!showRationale)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold text-slate-700">Why I made this</span>
              {showRationale ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showRationale && (
              <div className="p-4 pt-0 text-slate-600 text-sm space-y-2">
                <p>I basically binged Dispatch over the course of a week after the whole season released, and I really liked the stuff everyone liked (the animation, story, characters, voice acting, Telltale choice-based gameplay, dispatch gameplay, etc). However, I also liked one mechanic that I think is a bit underrated: how typical dispatches are "resolved" based on character vs task stats: the bouncing ball.</p>
                <p>IMO, the "bouncing ball check" (draw a shape for the task, draw a shape for player skills, and bounce a ball) has <strong>so many</strong> implications in RPG design that elevate it above other resolution mechanics like dX+bonus or dice pools, while keeping the same principles of randomness in the underlying chances + build expression by steering that randomness.</p>
                <p>For example: challenges/tasks can be made to act multi-attribute almost immediately, and skill points in a particular task could be distributed across the attributes to shore up weaknesses</p>
                <p>The system can even model stats using the very physics of the bouncing ball: maybe a lucky character has a ball that moves very slowly so it rarely moves out of center.</p>
                <p>Character synergies (and lack thereof) can even be expressed by adding together individual attributes much like how Dispatch does them, and concepts like "advantage/disadvantage" or situational boosts/nerfs can involve adding more balls or running a check multiple times with the same initial inputs</p>
                <p>Finally, the "auto-bonus"/"auto-fail" sections also help add more than just the physics, though I wonder if another cool idea is to add bumpers like a pinball game</p>
                <p>I looked around and didn't see anything online that replicated this nor did I see this mechanic in other games (though I might just be msising something, so please let me know if there is one!), so I quickly coded up an online simulator based on my singular playthrough of the game which can also work. It's not perfect, but I'd appreciate feedback and I'm hopeful that maybe we'll see this resolution system in more RPGs in the future (maybe even the CritRole game?)</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={600}
                  className="w-full max-w-2xl mx-auto"
                />
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={runResolution}
                  disabled={isAnimating}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Play size={20} />
                  Run Resolution
                </button>

                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw size={20} />
                  Reset
                </button>

                <button
                  onClick={() => setShowPhysicsPanel(!showPhysicsPanel)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Settings size={20} />
                  Physics
                </button>

                <div className="ml-4 text-center">
                  <div className="text-2xl font-bold text-slate-800">{overlapPercent}%</div>
                  <div className="text-sm text-slate-600">Success Chance</div>
                </div>

                {result && (
                  <div className={`ml-4 px-4 py-2 rounded-lg font-bold text-white ${result === 'bonus' ? 'bg-green-600' : result === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                    {result === 'bonus' ? 'SUCCESS WITH BONUS!' : result === 'success' ? 'SUCCESS!' : 'FAILURE!'}
                  </div>
                )}
              </div>

              {showPhysicsPanel && (
                <div className="mt-4 bg-purple-50 rounded-lg p-4">
                  <h3 className="font-bold text-purple-800 mb-3">Ball Physics Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">Initial Speed</span>
                        <span className="font-mono text-purple-600">{ballPhysics.speed}</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="20"
                        step="0.5"
                        value={ballPhysics.speed}
                        onChange={(e) => updatePhysics('speed', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">Friction</span>
                        <span className="font-mono text-purple-600">{ballPhysics.friction.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.90"
                        max="0.99"
                        step="0.01"
                        value={ballPhysics.friction}
                        onChange={(e) => updatePhysics('friction', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">Max Bounces</span>
                        <span className="font-mono text-purple-600">{ballPhysics.maxBounces}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={ballPhysics.maxBounces}
                        onChange={(e) => updatePhysics('maxBounces', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">Randomness</span>
                        <span className="font-mono text-purple-600">{ballPhysics.randomness.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={ballPhysics.randomness}
                        onChange={(e) => updatePhysics('randomness', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Attributes ({attributes.length})</h3>
                  <button
                    onClick={addAttribute}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <h3 className="font-bold text-blue-800 mb-3">Player Stats</h3>
                <div className="space-y-3">
                  {attributes.map((attr, i) => (
                    <div key={i} className="bg-white rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={attr.name}
                          onChange={(e) => updateAttributeName(i, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {attributes.length > 3 && (
                          <button
                            onClick={() => removeAttribute(i)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Value</span>
                        <span className="font-mono text-blue-600">{attr.playerValue}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={attr.playerValue}
                        onChange={(e) => updatePlayerStat(i, parseInt(e.target.value))}
                        className="w-full mb-3"
                      />

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-slate-600 block mb-1">Bonus at ≥</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={attr.bonus ?? ''}
                            onChange={(e) => updateBonus(i, e.target.value)}
                            placeholder="None"
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 block mb-1">Auto-Fail at ≥</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={attr.autoFail ?? ''}
                            onChange={(e) => updateAutoFail(i, e.target.value)}
                            placeholder="None"
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <h3 className="font-bold text-red-800 mb-3">Task Difficulty</h3>
                <div className="space-y-3">
                  {attributes.map((attr, i) => (
                    <div key={i} className="bg-white rounded p-3">
                      <div className="text-sm font-medium text-slate-700 mb-2">{attr.name}</div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Value</span>
                        <span className="font-mono text-red-600">{attr.taskValue}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={attr.taskValue}
                        onChange={(e) => updateTaskDifficulty(i, parseInt(e.target.value))}
                        className="w-full mb-3"
                      />

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-slate-600 block mb-1">Auto-Fail at ≥</label>
                          <span className="text-xs text-slate-500 block mb-1">(Player stat threshold)</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={attr.autoFail ?? ''}
                            onChange={(e) => updateAutoFail(i, e.target.value)}
                            placeholder="None"
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;