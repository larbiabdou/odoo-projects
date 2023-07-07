{
    'name': 'POS Quick Payment',
    'version': '',
    'summary': 'test',
    'description': 'test',
    'depends': ['point_of_sale'],
    'data': [
        'views/assets.xml',
        'views/pos_config_view.xml',
    ],
    'qweb': ['static/src/xml/pos.xml'],
    'installable': True,
    'auto_install': False,
}
