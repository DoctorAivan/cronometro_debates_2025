//  Object Socket
    var socket;

//  Status of the first init
    let init_status = false;

//  Time Limit
    let clock_limit = 300;

//  Init to load complete
    document.addEventListener("DOMContentLoaded", function(event)
    {
    //  Create Socket IO
        socket = io(SERVER_WEBSOCKET);

    //  -       -       -       -       -       -       -       -       -       -
    //  GLOBAL FUNCTIONS

    //  First Init
        socket.on('init', function(data)
        {
        //  Set clock Limit
            clock_limit = data.timelimit;

        //  Just run one time
            if(!init_status)
            {
            //  Change status
                init_status = true

            //  Get init configs
                Crono.init_set( data );

            //  Init clocks history
                Crono.init_clocks( data.clocks )
            }
        });
        
    //  Event Status
        socket.on('status', function(data)
        {
        //  Render object
            const render = document.getElementById("render");

        //  Validate status of render view
            if(data == 'on')
            {
                render.classList.remove('status-off')
                render.classList.add('status-on')
            }
            else
            {
                render.classList.remove('status-on')
                render.classList.add('status-off')
            }
        });

    //  -       -       -       -       -       -       -       -       -       -
    //  SINGLE FUNCTIONS

    //  Event Timer
        socket.on('elapsed', function(data)
        {
        //  Get candidate data
            let candidate = candidates.find(candidate => candidate.id == data.id);
            candidate.timer_total = data.elapsed;
            candidate.timer = true;
            
        //  Create UI in DOM
            Crono.draw( data.id );
        });

    //  Event Play
        socket.on('play_single', function(data)
        {
        //  Get candidate data
            let candidate = candidates.find(candidate => candidate.id == data.id);
            candidate.timer = true;
        });

    //  Event Paused
        socket.on('pause_single', function(data)
        {
        //  Get candidate data
            let candidate = candidates.find(candidate => candidate.id == data.id);
            candidate.timer = false;
        });

    //  Event Reset
        socket.on('reset_single', function(data)
        {
        //  Get candidate data
            let candidate = candidates.find(candidate => candidate.id == data.id);
            candidate.timer_total = 0;
            candidate.overtime = 0;
            candidate.timer = false;

        //  Create UI in DOM
            Crono.draw( data.id );
        });

    //  Event Set Overtime Single Clock
        socket.on('overtime_single', function(data)
        {
        //  Get candidate data
            let candidate = candidates.find(candidate => candidate.id == data.id);
            candidate.overtime = data.overtime;

        //  Create UI in DOM
            Crono.draw( data.id );
        });

    //  -       -       -       -       -       -       -       -       -       -
    //  GROUPS FUNCTIONS

    //  Time limit
        socket.on('global_time', function(data)
        {
            clock_limit = data;
            time_max = data;

            candidates.forEach(candidate =>
            {
                candidate.timer_total = 0;
                candidate.overtime = 0;
                candidate.timer = false;
                
            //  Create UI in DOM
                Crono.draw( candidate.id );
            });
        });

    //  Event Pause all clocks
        socket.on('pause_all', function(data)
        {
            candidates.forEach(candidate =>
            {
                candidate.timer = false;
            });
        });

    //  Event Reset All Clocks
        socket.on('reset_all', function(data)
        {
            candidates.forEach(candidate =>
            {
                candidate.timer_total = 0;
                candidate.overtime = 0;
                candidate.timer = false;
                
            //  Create UI in DOM
                Crono.draw( candidate.id );
            });
        });

    });

//  Candidate Render Functions
    const Crono =
    {
    //  Candidate List
        init : function()
        {
        //  Container render in HTML
            const render	=	document.getElementById('panel-candidates-list')

        //  Create candidate elements
            candidates.forEach(candidate =>
            {
            //  Create DIV element
                let objeto = document.createElement('div');

            //  Set candidate DIV options
                objeto.id = 'candidate-' + candidate.id
                objeto.className = 'candidate'

            //  Candidate HTML body
                objeto.innerHTML = `<div class="candidate-indicator"></div>
                                    <div class="candidate-poster">
                                        <img src="candidates/${candidate.image}.png" />
                                    </div>
                                    <div class="candidate-data">
                                        <div class="candidate-data-name">${candidate.name} <span>${candidate.last_name}</span></div>
                                        <div class="candidate-data-timer">
                                            <div class="candidate-data-timer-bar">
                                                <div class="candidate-data-timer-bar-bg" id="candidate-${candidate.id}-bar"></div>
                                            </div>
                                            <div class="candidate-data-timer-value" id="candidate-${candidate.id}-time">00:00</div>
                                        </div>
                                    </div>`

            //  Draw object in DOM
                render.appendChild(objeto);
            });

        //  Sort candidates
            Crono.order('AZ');

        //  Init time for update position
            timer_order = setInterval(() => { Crono.order() } , time_interval );
        },

    //  Init App
        init_set : function( data )
        {
        //  Max time
            time_max =  data.timelimit

        //  Render object
            const render = document.getElementById("panel-candidates-list");

            if(data.status == 'on')
            {
                render.classList.remove('status-off')
                render.classList.add('status-on')
            }
            else
            {
                render.classList.remove('status-on')
                render.classList.add('status-off')
            }

        //  Order of the objects
            candidates_order = data.order;
        },

    //  Init clocks history
        init_clocks : function ( data )
        {
            data.forEach(clock =>
            {
            //  Get candidate data
                let candidate = candidates.find(candidate => candidate.id == clock.id);
                candidate.timer_total = clock.time;
                candidate.overtime = clock.overtime;
                candidate.timer = clock.status;
                
            //  Create UI in DOM
                Crono.draw( clock.id );
            });            
        },

    //  Draw Inteface in the DOM
        draw : function( id )
        {
        //  Get candidate data
            let candidate = candidates.find(candidate => candidate.id == id);

        //  Get candidate time display
            let candidate_time = document.querySelector(`#candidate-${id}-time`);

        //  Get candidate time bar
            let candidate_bar = document.querySelector(`#candidate-${id}-bar`);

        //  Calculate width of the timer bar
            let candidate_bar_width = ( candidate.timer_total * 100 / (time_max + candidate.overtime) );

        //  Set the large of bar
            if( candidate_bar_width >= 100 )
            {
                candidate_bar.style.width = '0%';
            }
            else
            {
                candidate_bar.style.width = ( 100 - candidate_bar_width ) + '%';
            }

        //  Draw new data in DOM
            candidate_time.innerHTML = Crono.digit(candidate.timer_total, candidate.overtime);
        },

    //  Order candidates by time
        order : function( order )
        {
        //  ID of List
            i = 1;

        //  Read Candidates List
            candidates.forEach(candidate =>
            {
            //  Get object from DOM
                let candidate_div = document.querySelector(`#candidate-${candidate.id}`);

            //  Timer active
                if( candidate.timer )
                {
                //  Change position in DOM
                    if( candidate.timer_total >= (time_max + candidate.overtime) )
                    {
                        candidate_div.classList = `candidate complete order-${i}`;
                    }
                    else
                    {
                        candidate_div.classList = `candidate incomplete order-${i}`;
                    }
                }
                else
                {
                //  Change position in DOM
                    if( candidate.timer_total >= (time_max + candidate.overtime) )
                    {
                        candidate_div.classList = `candidate gray-scale complete order-${i}`;
                    }
                    else
                    {
                        candidate_div.classList = `candidate gray-scale incomplete order-${i}`;
                    }
                }

            //  Increment ID list
                i++;
            });
        },

    //  Validate digit display
        digit : function ( timer_total , overtime )
        {
            // Add overtime
            const final_time = (timer_total - overtime)

            // Calculate final time
            let time = Number(clock_limit - final_time);

            // Validate complete time
            if( time < 0 )
            {
                // Reverse stopwatch
                time = (final_time + clock_limit) - clock_limit * 2;
            }

            // Format time
            let h = Math.floor(time / 3600).toString().padStart(2,'0');
            let m = Math.floor(time % 3600 / 60).toString().padStart(2,'0');
            let s = Math.floor(time % 60).toString().padStart(2,'0');
        
            // Final time
            return `${m}:${s}`;
        }
    }