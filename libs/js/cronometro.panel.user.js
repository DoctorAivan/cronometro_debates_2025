//  Object Socket
    var socket;

//  Status of the first init
    let init_status = false;

//  Calculate time limit
    let crono_time_limit;

//  ID object
    let object_id;

//  Time Limit
    let clock_limit = 300;

//  Validate if Hash exist
    if( location.hash )
    {
        object_id = Number(location.hash.substr(1));
    }
    else
    {
        object_id = 1;
    }

//  Init to load complete
    document.addEventListener("DOMContentLoaded", function(event)
    {
    //  Create Socket IO
        socket = io(SERVER_WEBSOCKET);

    //  -       -       -       -       -       -       -       -       -       -
    //  GLOBAL FUNCTIONS

    //  Event Timer
        socket.on('init', function(data)
        {
        //  Set clock Limit
            clock_limit = data.timelimit;

        //  Status clocks
            init_status = "on"

        //  Max time
            time_max =  data.timelimit;

        //  Init clocks history
            Crono.init_clocks( data.clocks )
        });
    
    //  -       -       -       -       -       -       -       -       -       -
    //  SINGLE FUNCTIONS

    //  Event Timer
        socket.on('elapsed', function(data)
        {
        //  Validate if the correct object
            if( object_id == data.id )
            {
                let candidate = candidates.find(candidate => candidate.id == data.id);

                // Calculate final time
                const final_time = (data.elapsed - candidate.overtime)

                // Validate end time
                if( (clock_limit - final_time) == 0 )
                {
                    candidate.timer_total = data.elapsed;
                    candidate.timer = false;

                    Crono.draw( candidate.id );
                    Crono.pause();
                }
                else
                {
                    candidate.timer_total = data.elapsed;
                    candidate.timer = true;

                    Crono.draw( candidate.id );
                    Crono.play();
                }
            }
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
            });

        //  Draw in DOM the timer UI
            Crono.draw( object_id );

        //  Pause set UI DOM
            Crono.pause();

        //  Status of timer
            Crono.status();
        });

    //  Event Pause all clocks
        socket.on('pause_all', function(data)
        {
            candidates.forEach(candidate =>
            {
                candidate.timer = false;
            });

        //  Pause set UI DOM
            Crono.pause();

        //  Status of timer
            Crono.status();

        });

    //  Event Reset All Clocks
        socket.on('reset_all', function(data)
        {
            candidates.forEach(candidate =>
            {
                candidate.timer_total = 0;
                candidate.overtime = 0;
                candidate.timer = false;
            });

        //  Draw in DOM the timer UI
            Crono.draw( object_id );

        //  Pause set UI DOM
            Crono.pause();

        //  Status of timer
            Crono.status();

        //  Get contents for print times
            const select_minutes = document.getElementById("select-minutes")
            const select_seconds = document.getElementById("select-seconds")

            select_minutes.value = 0
            select_seconds.value = 0
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
            //  Validate if the correct object
                if( candidate.id == object_id )
                {
                //  Create DIV element
                    let objeto = document.createElement('div');

                //  Set candidate DIV options
                    objeto.id = 'candidate-' + candidate.id
                    objeto.className = 'candidate order-1'

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
                }
            });

        //  Get contents for print times
            const select_minutes = document.getElementById("select-minutes")
            const select_seconds = document.getElementById("select-seconds")

        //  Asign minutes to UI
            for (let i = 0; i < 6; i++)
            {
                let minute = i.toString().padStart(2,'0')
                select_minutes.insertAdjacentHTML('beforeend', `<option value="${i}">${minute} Min</option>`)
            }

        //  Asign seconds to UI
            for (let i = 0; i < 61; i++)
            {
                let second = i.toString().padStart(2,'0')
                select_seconds.insertAdjacentHTML('beforeend', `<option value="${i}">${second} Seg</option>`)
            }
        },

    //  Init clocks history
        init_clocks : function ( data )
        {
            data.forEach(clock =>
            {
            //  Validate if the correct object
                if( clock.id == object_id )
                {
                //  Get candidate data
                    let candidate = candidates.find(candidate => candidate.id == clock.id);
                    candidate.timer_total = clock.time;
                    candidate.overtime = clock.overtime;
                    candidate.timer = clock.status;
                    
                //  Create UI in DOM
                    Crono.draw( clock.id );
                }
            });            
        },

    //  Draw Inteface in the DOM
        draw : function( id )
        {
        //  Validate if the correct object
            if( object_id == id )
            {
            //  Get candidate data
                let candidate = candidates.find(candidate => candidate.id == id);

            //  Get object from DOM
                let candidate_div = document.querySelector(`#candidate-${id}`);

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

            //  Timer active
                if( candidate.timer )
                {
                //  Change position in DOM
                    if( candidate.timer_total >= (time_max + candidate.overtime) )
                    {
                        candidate_div.classList = `candidate complete order-1`;
                    }
                    else
                    {
                        candidate_div.classList = `candidate incomplete order-1`;
                    }
                }
                else
                {
                //  Change position in DOM
                    if( candidate.timer_total >= (time_max + candidate.overtime) )
                    {
                        candidate_div.classList = `candidate gray-scale complete order-1`;
                    }
                    else
                    {
                        candidate_div.classList = `candidate gray-scale incomplete order-1`;
                    }
                }
            }
        },

    //  Check status of the timer UI
        status : function ()
        {
        //  Get candidate data
            let candidate = candidates.find(candidate => candidate.id == object_id);

        //  Get object from DOM
            let candidate_div = document.querySelector(`#candidate-${object_id}`);

            //  Timer active
            if( candidate.timer )
            {
            //  Change position in DOM
                if( candidate.timer_total >= (time_max + candidate.overtime) )
                {
                    candidate_div.classList = `candidate complete order-1`;
                }
                else
                {
                    candidate_div.classList = `candidate incomplete order-1`;
                }
            }
            else
            {
            //  Change position in DOM
                if( candidate.timer_total >= (time_max + candidate.overtime) )
                {
                    candidate_div.classList = `candidate gray-scale complete order-1`;
                }
                else
                {
                    candidate_div.classList = `candidate gray-scale incomplete order-1`;
                }
            }
        },

    //  Play set UI DOM
        play : function ()
        {
        //  Remove item selected
            document.querySelectorAll('#status > div').forEach(function( item )
            {
                item.classList.remove('on');
                item.classList.add('off');
            });

        //  Select option marked
            const selected = document.getElementById('status-play');
            selected.classList.remove('off');
            selected.classList.add('on');
        },

        //  Play set socket
            set_play : function ()
            {
                // Get candidate data
                let candidate = candidates.find(candidate => candidate.id == object_id);

                // Validate clock status
                if( candidate.timer == false )
                {
                    candidate.timer = true;

                    Crono.play();
                    Crono.status();

                    socket.emit( 'fn_play_single' , object_id );
                }
            },

    //  Pause set UI DOM
        pause : function ()
        {
        //  Remove item selected
            document.querySelectorAll('#status > div').forEach(function( item )
            {
                item.classList.remove('on');
                item.classList.add('off');
            });

        //  Select option marked
            const selected = document.getElementById('status-pause');
            selected.classList.remove('off');
            selected.classList.add('on');
        },

        //  Pause set socket
            set_pause : function ()
            {
                // Get candidate data
                let candidate = candidates.find(candidate => candidate.id == object_id);

                // Validate clock status
                if( candidate.timer == true )
                {
                    candidate.timer = false;

                    Crono.pause();
                    Crono.status();

                    socket.emit( 'fn_pause_single' , object_id );
                }
            },

    //  Open modal reset action
        set_reset : function ()
        {
            Modal.open('modal-reset');
        },

        //  Confirm reset action
            set_reset_confirm : function ()
            {
            //  Close Modal
                Modal.close();

            //  Get candidate data
                let candidate = candidates.find(candidate => candidate.id == object_id);
                candidate.timer_total = 0;
                candidate.overtime = 0;
                candidate.timer = false;

            //  Get contents for print times
                const select_minutes = document.getElementById("select-minutes")
                const select_seconds = document.getElementById("select-seconds")

                select_minutes.value = 0
                select_seconds.value = 0

                Crono.draw( object_id );
                Crono.pause();
                Crono.status();

            //  Reset timer of object
                socket.emit( 'fn_reset_single', object_id );
            },

    //  Open modal set time action
        set_time : function ()
        {
            Modal.open('modal-set-time');

        //  Get contents for print times
            const select_minutes = document.getElementById("select-minutes")
            const select_seconds = document.getElementById("select-seconds")
            const set_time_value = document.getElementById("set-time-value")

        //  Set new time value to info modal
            set_time_value.innerHTML = '( ' + select_minutes.value.toString().padStart(2,'0') + ':' + select_seconds.value.toString().padStart(2,'0') + ' )'
        },

        //  Confirm set time action
            set_time_confirm : function ()
            {
            //  Get contents for print times
                const select_minutes = document.getElementById("select-minutes")
                const select_seconds = document.getElementById("select-seconds")

            //  Calculate new time
                let time = ( Number(select_minutes.value) * 60 ) + Number(select_seconds.value);

            //  Close Modal
                Modal.close();

            //  Get candidate data
                let candidate = candidates.find(candidate => candidate.id == object_id);
                candidate.overtime = time;

            //  Create UI in DOM
                Crono.draw( object_id );
                Crono.pause();
                Crono.status();

            //  Send to socket
                socket.emit( 'fn_overtime_single' , object_id , time )
            },

    //  Validate digit display
        digit : function ( timer_total , overtime )
        {
            // Add overtime
            const final_time = (timer_total - overtime)

            // Calculate final time
            let time = Number(clock_limit - final_time);

            // Validate complete time
            if( time == 0 )
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