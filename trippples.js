// DATA
const moves = [
    {dx: -1, dy: -1}, // move NW
    {dx: 0, dy: -1}, // move N
    {dx: 1, dy: -1}, // move NE
    {dx: 1, dy: 0}, // move E
    {dx: 1, dy: 1}, // move SE
    {dx: 0, dy: 1}, // move S
    {dx: -1, dy: 1}, // move SW
    {dx: -1, dy: 0}, // move W
]

const tileCodes = [
    '013', '124', '467', '356',
    '035', '012', '247', '567',
    '045', '026', '237', '157',
    '025', '027', '257', '057',
    '136', '134', '146', '346',
    '145', '046', '236', '137',
    '023', '127', '457', '056',
    '015', '024', '267', '357',
    '245', '067', '235', '017',
    '047', '256', '037', '125',
    '234', '167', '345', '016',
    '156', '034', '126', '347',
    '014', '246', '367', '135',
    '456', '036', '123', '147'
]

const lineEndPoints = [
    {x: 5, y: 5}, // NW
    {x: 25, y: 5}, // N
    {x: 45, y: 5}, // NE
    {x: 45, y: 25}, // E
    {x: 45, y: 45}, // SE
    {x: 25, y: 45}, // S
    {x: 5, y: 45}, // SW
    {x: 5, y: 25}, // W
]

// UTIL
const copy = (o) => {
    const newObject = {}
    for (const element in o) {
        if (typeof o[element] === 'object') {
            if (Array.isArray(o[element])) {
                newObject[element] = [...o[element]]
            } else {
                newObject[element] = copy(o[element])
            }
        } else {
            newObject[element] = o[element]
        }
    }
    return newObject
}

const makeTileObject = tileCode => {
    const tileMoves = []
    for (let i = 0; i < tileCode.length; i++) {
        tileMoves.push(tileCode.charAt(i) - '0')
    }
    return {code: tileCode, directions: tileMoves}
}

const generateSVG = (code) => {
    if (code.charAt(0) === 'c' || code.charAt(0) === 's') return ''
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">'
    for (let i = 0; i < code.length; i++) {
        svg += `<line x1="25" y1="25" x2="${lineEndPoints[code.charAt(i) - '0'].x}" y2="${lineEndPoints[code.charAt(i) - '0'].y}" stroke-width="4" stroke="white"/>`
    }
    svg += '</svg>'
    return `url('data:image/svg+xml,${svg}')`
}

const getBoard = () => {
    const tiles = tileCodes
        .map(tc => ({...makeTileObject(tc)}))
        .map(tile => ({tile, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({tile}) => tile)
    const cStart = {code: 'cStart', directions: [0, 1, 2, 3, 4, 5, 6, 7]}
    const sStart = {code: 'sStart', directions: [0, 1, 2, 3, 4, 5, 6, 7]}
    const cEnd = {code: 'cEnd', directions: null}
    const sEnd = {code: 'sEnd', directions: null}
    const center = [{code: 'center0', moves: null}, {code: 'center1', moves: null}, {
        code: 'center2',
        moves: null
    }, {code: 'center3', moves: null}]
    return [
        [sEnd, ...tiles.splice(0, 6), cEnd,],
        [...tiles.splice(0, 8),],
        [...tiles.splice(0, 8),],
        [...tiles.splice(0, 3), center[0], center[1], ...tiles.splice(0, 3),],
        [...tiles.splice(0, 3), center[2], center[3], ...tiles.splice(0, 3),],
        [...tiles.splice(0, 8),],
        [...tiles.splice(0, 8),],
        [cStart, ...tiles.splice(0, 6), sStart]
    ]
}

// BRAIN
const brainMove = () => {
    let moveCoordinates
    switch (state.game.difficulty) {
        case 1:
            // random
            const moveIndex = Math.floor(Math.random() * state.game.current.validCoordinates.length)
            moveCoordinates = state.game.current.validCoordinates[moveIndex]
            break
        case 2:
            // manhattan
            moveCoordinates = state.game.current.validCoordinates
                .map(c => ({x: c.charAt(1) - '0', y: c.charAt(4) - '0'}))
                .map(c => ({distance: calculateManhattan(c), c}))
                .sort((a, b) => a.distance - b.distance)
                .map(s => s.c)
                .map(c => `(${c.x}, ${c.y})`)[0]
            break
        case 3:
            // euclidean
            moveCoordinates = state.game.current.validCoordinates
                .map(c => ({x: c.charAt(1) - '0', y: c.charAt(4) - '0'}))
                .map(c => ({distance: calculateEuclidean(c), c}))
                .sort((a, b) => a.distance - b.distance)
                .map(s => s.c)
                .map(c => `(${c.x}, ${c.y})`)[0]
            break
        default:
            const playingPieceCoordinates = document.getElementById(state.game.aiPlayer).parentElement.id
            const nonPlayingPiece = state.game.aiPlayer === 'circle' ? 'square' : 'circle'
            const nonPlayingPieceCoordinates = document.getElementById(nonPlayingPiece).parentElement.id
            const result = minimax(state.game.aiPlayer, playingPieceCoordinates,
                nonPlayingPiece, nonPlayingPieceCoordinates, state.game.difficulty - 3)
            moveCoordinates = result.move
            break
    }
    // submit move
    gameLogic(document.getElementById(moveCoordinates))
}

const calculateManhattan = (coordinates) => {
    if (state.game.current.player === 'square') {
        return coordinates.x + coordinates.y
    } else {
        return 7 - coordinates.x + coordinates.y
    }
}

const calculateEuclidean = (coordinates) => {
    if (state.game.current.player === 'square') {
        return Math.hypot(coordinates.x, coordinates.y)
    } else {
        return Math.hypot(7 - coordinates.x, coordinates.y)
    }
}

// TODO: when you cannot move simulate opponent having a double turn
// TODO: do not consider moves that result in a cycle (possibly removes infinite loop described in gameLogic())
const minimax = (a, aCoordinates, b, bCoordinates, depth, alpha = -Infinity, beta = Infinity, isMaximising = true) => {
    const nextMoves = getNextMoves(a, aCoordinates, b, bCoordinates)

    // base case: if winning move give best scores
    if (bCoordinates === '(0, 0)' || bCoordinates === '(7, 0)') {
        let eval
        if (isMaximising) {
            eval = -Infinity
        } else {
            eval = Infinity
        }
        return {eval: eval, move: isMaximising ? aCoordinates : bCoordinates}
    }

    // base case: max depth reached
    if (depth === 0 || nextMoves.length === 0) {
        let eval
        if (isMaximising) {
            eval = evaluatePosition(a, aCoordinates, b, bCoordinates)
        } else {
            eval = evaluatePosition(b, bCoordinates, a, aCoordinates)
        }
        return {eval: eval, move: isMaximising ? aCoordinates : bCoordinates}
    }

    // recursive case
    if (isMaximising) {
        let maxEval = -Infinity
        let maxMove = ''
        for (let i = 0; i < nextMoves.length; i++) {
            const {eval} = minimax(b, bCoordinates, a, nextMoves[i], depth - 1, alpha, beta, !isMaximising)
            if (eval >= maxEval) {
                maxEval = eval
                maxMove = nextMoves[i]
            }
            alpha = Math.max(alpha, eval)
            if (beta <= alpha) break
        }
        return {eval: maxEval, move: maxMove}
    } else {
        let minEval = Infinity
        let minMove = ''
        for (let i = 0; i < nextMoves.length; i++) {
            const {eval} = minimax(b, bCoordinates, a, nextMoves[i], depth - 1, alpha, beta, !isMaximising)
            if (eval <= minEval) {
                minEval = eval
                minMove = nextMoves[i]
            }
            beta = Math.min(beta, eval)
            if (beta <= alpha) break
        }
        return {eval: minEval, move: minMove}
    }
}

const evaluatePosition = (a, aCoordinates, b, bCoordinates) => {
    if (a === 'circle') {
        const aDistance = Math.hypot(7 - aCoordinates.charAt(1) - '0', aCoordinates.charAt(4) - '0')
        const bDistance = Math.hypot(bCoordinates.charAt(1) - '0', bCoordinates.charAt(4) - '0')
        return bDistance - aDistance
    } else {
        const aDistance = Math.hypot(aCoordinates.charAt(1) - '0', aCoordinates.charAt(4) - '0')
        const bDistance = Math.hypot(7 - bCoordinates.charAt(1) - '0', bCoordinates.charAt(4) - '0')
        return bDistance - aDistance
    }
}

const getNextMoves = (playingPiece, playingPieceCoordinates, nonPlayingPiece, nonPlayingPieceCoordinates) => {
    const nonPlayingX = nonPlayingPieceCoordinates.charAt(1) - '0'
    const nonPlayingY = nonPlayingPieceCoordinates.charAt(4) - '0'
    if (nonPlayingPieceCoordinates === '(0, 0)' || nonPlayingPieceCoordinates === '(7, 0)') return []
    return state.game.board[nonPlayingY][nonPlayingX].directions
        .map(d => moves[d])
        .map(m => ({
            x: playingPieceCoordinates.charAt(1) - '0' + m.dx,
            y: playingPieceCoordinates.charAt(4) - '0' + m.dy
        }))
        .filter(c => c.x > -1 && c.x < 8 && c.y > -1 && c.y < 8 && // filter out of bounds
            !(c.x === nonPlayingX && c.y === nonPlayingY) && // filter out occupied tiles
            !(c.x === 3 && c.y === 3) &&
            !(c.x === 4 && c.y === 3) &&
            !(c.x === 3 && c.y === 4) &&
            !(c.x === 4 && c.y === 4) && // filter out the center tiles
            !(c.x === 0 && c.y === 7) &&
            !(c.x === 7 && c.y === 7) && // filter out moving onto start tiles
            !(playingPiece === 'circle' && c.x === 0 && c.y === 0) &&
            !(playingPiece === 'square' && c.x === 7 && c.y === 0)) // filter out moving onto opponents end tile
        .map(c => `(${c.x}, ${c.y})`)
}

// GAME LOGIC
const gameLogic = (tileDiv) => {
    const piece = document.getElementById(state.game.current.player)
    // check if move is valid
    if (state.game.current.validCoordinates.indexOf(tileDiv.id) >= 0) {
        const tileX = tileDiv.id.charAt(1) - '0'
        const tileY = tileDiv.id.charAt(4) - '0'
        // remove highlighted tiles
        resetHighlightedTiles()
        // move the piece
        tileDiv.appendChild(piece.parentNode.removeChild(piece))
        // check if the piece has made it to the end
        if (state.game.current.player === 'circle' && tileX === 7 && tileY === 0) {
            state.ui.scores.circleWins++
            state.ui.scores.circleSpan.textContent = `circle: ${state.ui.scores.circleWins}`
            reset()
        } else if (state.game.current.player === 'square' && tileX === 0 && tileY === 0) {
            state.ui.scores.squareWins++
            state.ui.scores.squareSpan.textContent = `square: ${state.ui.scores.squareWins}`
            reset()
        } else {
            updateTurn(tileX, tileY)
            // update the move sequence and check for a cyclic sequence
            state.game.cycleDetection.moveSequence.push({player: piece.id, coordinates: tileDiv.id})
            findCyclicRepeat(state.game.cycleDetection)
            if (state.game.cycleDetection.foundCycle) {
                state.ui.scores.draws++
                state.ui.scores.drawsSpan.textContent = `draws: ${state.ui.scores.draws}`
                // TODO: GAME STILL HANGS IF CIRCLE IS AI AND OPENS WITH A CYCLE
                //      - FIND MORE ELEGANT FIX

                // if AI plays circle and starts by moving in a cycle which prevents square from moving to prevent an infinite loop
                // where the board is reset and the AI moves in the same cycle, a new board is used
                // the check to see if square appears in the move sequence prevents a new board if the game becomes a draw organically
                if (state.game.difficulty > 0 && state.game.aiPlayer === 'circle' &&
                    state.game.cycleDetection.moveSequence.filter(m => m.player === 'square').length === 0) {
                    reset(true)
                } else {
                    reset()
                }
            }
            // if AI is on, and it's the AI's turn let it move
            if (state.game.difficulty > 0 && state.game.current.player === state.game.aiPlayer) brainMove()
        }
    }
}

const updateTurn = (endX, endY, recursion = 0) => {
    // base case: both players cannot move
    if (recursion === 2) {
        state.ui.scores.draws++
        state.ui.scores.drawsSpan.textContent = `draws: ${state.ui.scores.draws}`
        console.log('no one can move')
        reset()
    }
    // swap the currentPlayer
    state.game.current.player = state.game.current.player === 'circle' ? 'square' : 'circle'
    // get the id of the div that is the parent of the new player's piece
    const newPieceId = document.getElementById(state.game.current.player).parentElement.id
    // get the coordinates of the new player's piece
    const newPlayerX = newPieceId.charAt(1) - '0'
    const newPlayerY = newPieceId.charAt(4) - '0'
    // calculate the valid coordinates for the new player to choose
    state.game.current.validCoordinates = state.game.board[endY][endX].directions
        .map(d => moves[d]) // convert direction to move deltas e.g. 3 => {dx: 1, dy: 0}
        .map(m => ({x: newPlayerX + m.dx, y: newPlayerY + m.dy})) // calculate coordinates
        .filter(c => c.x > -1 && c.x < 8 && c.y > -1 && c.y < 8 && // filter out of bounds
            !(c.x === endX && c.y === endY) && // filter out occupied tiles
            !(c.x === 3 && c.y === 3) &&
            !(c.x === 4 && c.y === 3) &&
            !(c.x === 3 && c.y === 4) &&
            !(c.x === 4 && c.y === 4) && // filter out the center tiles
            !(c.x === 0 && c.y === 7) &&
            !(c.x === 7 && c.y === 7) && // filter out moving onto start tiles
            !(state.game.current.player === 'circle' && c.x === 0 && c.y === 0) &&
            !(state.game.current.player === 'square' && c.x === 7 && c.y === 0) // filter out moving onto opponents end tile
        ).map(c => `(${c.x}, ${c.y})`) // convert to string
    // if validCoordinates = []: swap players and calculate coordinates
    if (state.game.current.validCoordinates.length === 0) {
        updateTurn(newPlayerX, newPlayerY, recursion + 1)
    }
}

const findCyclicRepeat = (variables) => {
    const n = variables.moveSequence.length - 1
    if (variables.pointers.length === 0) {
        // if no pointers are being tracked, check if arr[n] has appeared before
        // if so add the elements index to pointers arr
        variables.moveSequence.slice(0, n).forEach((e, index) => {
            if (e.player === variables.moveSequence[n].player &&
                e.coordinates === variables.moveSequence[n].coordinates) {
                variables.pointers.push(index)
            }
        })
        if (variables.pointers.length > 0) {
            // if pointers are now being tracked because arr[n] has appeared before
            // store n + 1 as the index of the repeated element
            // the element at n is the first repeated element but that is where the sequence starts from and
            // is not the first move in a sequence of subsequent moves
            variables.repeatedElementIndex = n + 1
        }
        return
    }
    // advance all the tracked pointers by 1
    variables.pointers = variables.pointers.map(p => p + 1)
    variables.pointers.forEach((p, index) => {
        if (variables.moveSequence[p].player !== variables.moveSequence[n].player ||
            variables.moveSequence[p].coordinates !== variables.moveSequence[n].coordinates) {
            // if the pointer points to a value not equal to the latest move don't track the pointer anymore
            variables.pointers.splice(index, 1)
            if (variables.pointers.length === 0) variables.repeatedElementIndex = -1
        } else {
            // the pointer points to a value equal to the latest move
            if (variables.moveSequence[n].player === variables.moveSequence[variables.repeatedElementIndex].player &&
                variables.moveSequence[n].coordinates === variables.moveSequence[variables.repeatedElementIndex].coordinates &&
                p === variables.repeatedElementIndex) {
                // if the latest move is equal to the first move of the sequence it means a cycle has been detected
                // if the pointer is equal to repeatedElementIndex it means the player has attempted to repeat the cycle for the 3rd time
                variables.foundCycle = true
            }
        }
    })
}

// GAME LOGIC HANDLERS
const handleTileClick = (tileDiv) => {
    if (tileDiv.id !== '(0, 0)' && tileDiv.id !== '(7, 0)' &&
        tileDiv.id !== '(0, 7)' && tileDiv.id !== '(7, 7)' &&
        tileDiv.id !== '(3, 3)' && tileDiv.id !== '(4, 3)' &&
        tileDiv.id !== '(3, 4)' && tileDiv.id !== '(4, 4)'
    ) {
        if (tileDiv.style.backgroundColor === '') {
            tileDiv.style.backgroundColor = 'dodgerblue'
            state.game.highlightedTiles.add(tileDiv.id)
        } else {
            tileDiv.style.backgroundColor = ''
            state.game.highlightedTiles.delete(tileDiv.id)
        }
    }
}

const handlePieceDrag = (event, pieceImg) => event.dataTransfer.setData('text/plain', pieceImg.id);

const handlePieceDrop = (event, tileDiv) => {
    if (state.game.current.player === event.dataTransfer.getData('text')) gameLogic(tileDiv)
}

// RENDERING
const createBoard = () => {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const div = document.createElement('div')
            div.id = `(${j}, ${i})`
            div.style.backgroundImage = generateSVG(state.game.board[i][j].code)
            div.style.width = '50px'
            div.style.height = '50px'
            div.style.boxShadow = '0 0 0 1px black inset'
            div.style.display = 'flex'
            div.style.justifyContent = 'center'
            div.style.alignItems = 'center'
            div.onclick = () => handleTileClick(div)
            div.ondrop = (event) => handlePieceDrop(event, div)
            div.ondragover = (event) => event.preventDefault()
            state.ui.board.boardDiv.appendChild(div)
        }
    }
    // set the color of the end zones
    document.getElementById('(0, 0)').style.backgroundColor = 'limegreen'
    document.getElementById('(7, 0)').style.backgroundColor = 'orangered'
    // set color of the center
    document.getElementById('(3, 3)').style.backgroundColor = 'black'
    document.getElementById('(4, 3)').style.backgroundColor = 'black'
    document.getElementById('(3, 4)').style.backgroundColor = 'black'
    document.getElementById('(4, 4)').style.backgroundColor = 'black'
    // set color of the start zones
    document.getElementById('(0, 7)').style.backgroundColor = 'black'
    document.getElementById('(7, 7)').style.backgroundColor = 'black'
    // place the pieces
    document.getElementById('(0, 7)').appendChild(createPiece('circle'))
    document.getElementById('(7, 7)').appendChild(createPiece('square'))
}

const reRenderBoard = () => {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            document.getElementById(`(${j}, ${i})`).style.backgroundImage = generateSVG(state.game.board[i][j].code)
        }
    }
}

const resetPieces = () => {
    // reset the position of the pieces
    const circle = document.getElementById('circle')
    const square = document.getElementById('square')
    document.getElementById('(0, 7)').appendChild(circle.parentElement.removeChild(circle))
    document.getElementById('(7, 7)').appendChild(square.parentElement.removeChild(square))
}

const createPiece = (piece) => {
    const pieceImage = document.createElement('img')
    pieceImage.id = piece
    pieceImage.width = 50
    pieceImage.height = 50;
    pieceImage.draggable = true
    pieceImage.src = piece === 'circle' ? `data:image/svg+xml;utf8,
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <circle cx="25" cy="25" r="15" stroke-width="3" stroke="orangered" fill="none"/>
                    </svg>` : `data:image/svg+xml;utf8,
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                        <rect x="10" y="10" width="30" height="30" stroke-width="3" stroke="limegreen" fill="none"/>
                    </svg>`
    pieceImage.ondragstart = (event) => handlePieceDrag(event, pieceImage)
    return pieceImage
}

const resetHighlightedTiles = () => state.game.highlightedTiles.forEach(id => {
    document.getElementById(`${id}`).style.backgroundColor = ''
    state.game.highlightedTiles.delete(id)
})

// RESET
const reset = (withNewBoard = false) => {
    // debug each game allows inspection of moves made
    state.game.cycleDetection.moveSequence.forEach(m => console.log(m))

    state.game.cycleDetection.moveSequence = []
    state.game.cycleDetection.pointers = []
    state.game.cycleDetection.repeatedElementIndex = null
    state.game.cycleDetection.foundCycle = false
    state.game.current.player = 'circle'
    state.game.current.validCoordinates = ['(0, 6)', '(1, 6)', '(1, 7)']

    if (withNewBoard) {
        state.game.board = getBoard()
        reRenderBoard()
    }
    resetPieces()
    resetHighlightedTiles()

    if (state.game.difficulty > 0 && state.game.aiPlayer === state.game.current.player) brainMove()
}

// STATE
const state = {
    game: {
        board: getBoard(),
        current: {
            player: 'circle',
            validCoordinates: ['(0, 6)', '(1, 6)', '(1, 7)']
        },
        difficulty: 0,
        aiPlayer: 'square',
        highlightedTiles: new Set(),
        cycleDetection: {
            moveSequence: [],
            pointers: [],
            repeatedElementIndex: -1,
            foundCycle: false
        }
    },
    ui: {
        board: {
            boardDiv: document.getElementById('board'),
            newBoardButton: document.getElementById('newBoard')
        },
        mode: {
            modeRange: document.getElementById('difficultyRange'),
            AIMenuDiv: document.getElementById('aiPlayerChooser'),
            changeAIPlayerButton: document.getElementById('singlePlayerCharacterSwap'),
        },
        scores: {
            circleSpan: document.getElementById('circleWins'),
            circleWins: 0,
            squareSpan: document.getElementById('squareWins'),
            squareWins: 0,
            drawsSpan: document.getElementById('draws'),
            draws: 0,
            resetButton: document.getElementById('resetScores')
        }
    }
}

// UI HANDLERS
state.ui.board.newBoardButton.onclick = () => reset(true)

state.ui.scores.resetButton.onclick = () => {
    state.ui.scores.circleSpan.textContent = 'circle: 0'
    state.ui.scores.circleWins = 0
    state.ui.scores.squareSpan.textContent = 'square: 0'
    state.ui.scores.squareWins = 0
    state.ui.scores.drawsSpan.textContent = 'draws: 0'
    state.ui.scores.draws = 0
}

state.ui.mode.modeRange.oninput = () => {
    state.game.difficulty = state.ui.mode.modeRange.value - '0'
    state.ui.mode.modeRange.labels[0].textContent = `${state.game.difficulty}`
    switch (state.game.difficulty) {
        case 0:
            state.ui.mode.modeRange.labels[0].textContent = 'two player'
            state.ui.mode.AIMenuDiv.style.display = 'none'
            state.ui.mode.changeAIPlayerButton.textContent = 'square'
            state.game.aiPlayer = 'square'
            break
        case 1:
            state.ui.mode.modeRange.labels[0].textContent = 'random ai'
            state.ui.mode.AIMenuDiv.style.display = 'flex'
            break
        case 2:
            state.ui.mode.modeRange.labels[0].textContent = 'manhattan ai'
            state.ui.mode.AIMenuDiv.style.display = 'flex'
            break
        case 3:
            state.ui.mode.modeRange.labels[0].textContent = 'euclidean ai'
            state.ui.mode.AIMenuDiv.style.display = 'flex'
            break
        default:
            state.ui.mode.modeRange.labels[0].textContent = `minimax(depth=${state.game.difficulty - 3}) ai`
            state.ui.mode.AIMenuDiv.style.display = 'flex'
    }
    reset()
}

state.ui.mode.changeAIPlayerButton.onclick = () => {
    if (state.game.aiPlayer === 'square') {
        state.game.aiPlayer = 'circle'
        state.ui.mode.changeAIPlayerButton.textContent = 'circle'
    } else {
        state.game.aiPlayer = 'square'
        state.ui.mode.changeAIPlayerButton.textContent = 'square'
    }
    reset()
}

// ENTRY POINT
createBoard()
