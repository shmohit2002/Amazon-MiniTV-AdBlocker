chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
        'id': 1001,
        'priority': 1,
        'action': {
            'type': 'block'
        },
        'condition': {
            'urlFilter': 'cdn-a.amazon-adsystem.com',
            'resourceTypes': ['main_frame']
        }
    }],
    removeRuleIds: [1001]
})