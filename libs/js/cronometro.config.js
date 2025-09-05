//  Interval ratio
    let time_interval = 1000;

//  Max time
    let time_max = 120;

//  Order of the object
    let candidates_order = 'DESC';

    const SERVER_WEBSOCKET = 'ws://10.81.128.108:5000'
    //const SERVER_WEBSOCKET = 'ws://localhost:5000'

//  Candidates Object
    const candidates = [
        { id: 1, image: '04', name: 'JOSÉ ANTONIO', last_name: 'KAST', timer: false, timer_total: 0, overtime: 0 },
        { id: 2, image: '02', name: 'JEANNETTE', last_name: 'JARA', timer: false, timer_total: 0, overtime: 0 },
        { id: 3, image: '08', name: 'EDUARDO', last_name: 'ARTÉS', timer: false, timer_total: 0, overtime: 0 },
        { id: 4, image: '06', name: 'H.', last_name: 'MAYNE-NICHOLLS', timer: false, timer_total: 0, overtime: 0 },
        { id: 5, image: '07', name: 'FRANCO', last_name: 'PARISI', timer: false, timer_total: 0, overtime: 0 },
        { id: 6, image: '03', name: 'JOHANNES', last_name: 'KAISER', timer: false, timer_total: 0, overtime: 0 },
        { id: 7, image: '05', name: 'EVELYN', last_name: 'MATTHEI', timer: false, timer_total: 0, overtime: 0 },
        { id: 8, image: '01', name: 'M.', last_name: 'ENRÍQUEZ-OMINAMI', timer: false, timer_total: 0, overtime: 0 }
    ];

//  Create Interval Object
    let time_order;
