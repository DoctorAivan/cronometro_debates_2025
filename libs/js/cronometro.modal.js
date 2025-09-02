
//  Save ID Modal
    let modal_id = '';

//  Modal options
    const Modal =
    {
    //  Modal open
        open : function( id )
        {
            document.body.style.overflow = 'hidden';

            let modal = document.getElementById( id );

            modal.style.display = 'grid';
            modal.classList.remove('modal-fade-out');
            modal.classList.add('modal-fade-in');

            modal_id = id;
        },

    //  Modal close
        close : function()
        {
            document.body.style.removeProperty('overflow');

            let modal = document.getElementById( modal_id );
            
            modal.classList.remove('modal-fade-in');
            modal.classList.add('modal-fade-out');

            modal_id = '';
        },

    //  Modal loading dialog
        loading : function()
        {
            let modal_loading = document.getElementById( modal_id ).getElementsByClassName('modal-content-loading')[0];
            modal_loading.style.display = 'grid';
        },

    //  Modal Loading complete
        loading_complete : function()
        {
            let modal_loading = document.getElementById( modal_id ).getElementsByClassName('modal-content-loading')[0];
            modal_loading.style.display = 'none';
        }
    }