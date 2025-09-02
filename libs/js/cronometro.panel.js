//  Object Socket
    var socket;

//  Status of the first init
    let init_status = false;

//  Calculate time limit
    let crono_time_limit;

//  Time Limit
    let clock_limit = 300;

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
            init_status = data.status;

        //  Get init configs
            Crono.init_set( data );

        //  Init clocks history
            Crono.init_clocks( data.clocks )
        });

    //  Event Set Order
        socket.on('order', function(data)
        {
            Crono.order(data);
        });

    //  Event Status
        socket.on('status', function(data)
        {
        //  Render object
            const render = document.getElementById("panel-candidates-list");

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
            Crono.order('DESC');

        //  Init time for update position
            timer_order = setInterval(() => { Crono.order() } , time_interval );
        },

    //  Init App
        init_set : function( data )
        {
        //  Set new time limit
            time_max =  data.timelimit

        //  Set the object
            let time_max_id = ( data.timelimit / 60 );

        //  Object in UI time limit
            const time_limit = document.getElementById('time-limit-' + time_max_id );
            time_limit.classList.remove('off');
            time_limit.classList.add('on');

        //  Object in UI time limit
            const status = document.getElementById('status-' + data.status );
            status.classList.remove('off');
            status.classList.add('on');

        //  Render object
            const render = document.getElementById("panel-candidates-list");

        //  Change UI status
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

        //  Object in UI order
            const order = document.getElementById('order-' + data.order );
            order.classList.remove('off');
            order.classList.add('on');

        //  Order of the object
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
        //  Save order value
            if(order)
            {
                candidates_order = order;
            }

        //  Descending order
            if( candidates_order == 'DESC' )
            {
                candidates.sort((a, b) => ((b.timer_total - b.overtime) > (a.timer_total - a.overtime)) ? 1 : ((b.timer_total - b.overtime) === (a.timer_total - a.overtime)) ? ((a.id > b.id) ? 1 : -1) : -1 )
            }
            
        //  Ascending order
            if( candidates_order == 'ASC' )
            {
                candidates.sort((a, b) => ((a.timer_total - a.overtime) > (b.timer_total - b.overtime)) ? 1 : ((a.timer_total - a.overtime) === (b.timer_total - b.overtime)) ? ((b.id > a.id) ? 1 : -1) : -1 )
            }

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
        },

    //  Set status of view
        set_status : function ( status )
        {
            if( init_status != status )
            {
                const buttom_on = document.getElementById('status-on');
                const buttom_off = document.getElementById('status-off');

                if( status == 'on' )
                {
                    buttom_on.classList.remove('off');
                    buttom_on.classList.add('on');
                    buttom_off.classList.remove('on');
                    buttom_off.classList.add('off');

                    init_status = 'on'
                }
                else
                {
                    buttom_on.classList.remove('on');
                    buttom_on.classList.add('off');
                    buttom_off.classList.remove('off');
                    buttom_off.classList.add('on');

                    init_status = 'off'
                }

                socket.emit( 'status' , status );
            }
        },

    //  Set order of elements
        set_order : function ( order )
        {
            const order_ac = document.getElementById('order-ASC');
            const order_dc = document.getElementById('order-DESC');

            if( order == 'ASC' )
            {
                order_ac.classList.remove('off');
                order_ac.classList.add('on');
                order_dc.classList.remove('on');
                order_dc.classList.add('off');
            }
            else
            {
                order_ac.classList.remove('on');
                order_ac.classList.add('off');
                order_dc.classList.remove('off');
                order_dc.classList.add('on');
            }

            socket.emit( 'order' , order );
        },

    //  Open Modal with confirm
        set_time_limit : function ( id )
        {
            Modal.open('modal-time-limit');

        //  Save time limit
            crono_time_limit = id;

            const set_time_value = document.getElementById("set-time-value")

            let response

            if( id == 1 )
            {
                response = '1 Minuto';
            }
            else if( id == 3 )
            {
                response = '3 Minutos';
            }
            else if( id == 5 )
            {
                response = '5 Minutos';
            }
            else
            {
                response = '0 Minutos';
            }

        //  Set new time value to info modal
            set_time_value.innerHTML = response;
        },

        //  Set order of elements
            set_time_limit_confirm : function ()
            {
            //  Remove item selected
                document.querySelectorAll('#time-limit > div').forEach(function( item )
                {
                    item.classList.remove('on');
                    item.classList.add('off');
                });

            //  Select option marked
                const selected = document.getElementById('time-limit-' + crono_time_limit );
                selected.classList.remove('off');
                selected.classList.add('on');

            //  Calculate new time limit
                let time_limit = ( crono_time_limit * 60 );
                socket.emit( 'fn_global_time' , time_limit );

            //  Reboot all clocks
            //  socket.emit('reboot');
                
            //  Close Modal
                Modal.close();
            },


    //  Open Modal with confirm
        set_reboot : function ()
        {
            Modal.open('modal-reboot');
        },

        //  Confirm reboot action
            set_reboot_confirm : function ()
            {
            //  Close Modal
                Modal.close();

            //  Reboot all clocks
                socket.emit('fn_reset_all');
            },

    //  Open Modal with confirm
        set_pause_all : function ()
        {
            Modal.open('modal-pause-all');
        },

        //  Confirm pause all action
            set_pause_all_confirm : function ()
            {
            //  Close Modal
                Modal.close();

            //  Pause all clocks
                socket.emit('fn_pause_all');
            }
    }