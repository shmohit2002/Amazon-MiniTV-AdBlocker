chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
        'id': 1001,
        'priority': 1,
        'action': {
            'type': 'block'
        },
        'condition': {
            'urlFilter': '*.amazon-adsystem.com',
            'resourceTypes': ['main_frame','media']
        }
    },
    {
        'id': 1002,
        'priority': 1,
        'action': {
            'type': 'block'
        },
        'condition': {
            'urlFilter': 'm.media-amazon.com/images/*mp4*',
            'resourceTypes': ['main_frame','media']
        }
    }],
    removeRuleIds: [1001,1002]
})
