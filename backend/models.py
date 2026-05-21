BLP_LEVELS  = ['Top Secret', 'Secret', 'Confidential', 'Unclassified']
BIBA_LEVELS = ['High', 'Medium', 'Low']

def level_index(model: str, level: str) -> int:
    levels = BLP_LEVELS if model == 'blp' else BIBA_LEVELS
    return levels.index(level)

def check_blp(subject_level, object_level, operation, rules) -> dict:
    si = level_index('blp', subject_level)
    oi = level_index('blp', object_level)
    if operation == 'read':
        if not rules.get('no_read_up', True):
            return {'allowed': True, 'reason': 'Simple security rule disabled.'}
        if si <= oi:
            return {'allowed': True,  'reason': f'Simple security: {subject_level} dominates {object_level}.'}
        else:
            return {'allowed': False, 'reason': f'No read-up violated: {subject_level} cannot read {object_level}.'}
    elif operation == 'write':
        if not rules.get('no_write_down', True):
            return {'allowed': True, 'reason': 'Star-property disabled.'}
        if si >= oi:
            return {'allowed': True,  'reason': f'Star-property satisfied: {subject_level} writes to {object_level}.'}
        else:
            return {'allowed': False, 'reason': f'Star-property violated: {subject_level} would write DOWN to {object_level}.'}

def check_biba(subject_level, object_level, operation, rules) -> dict:
    si = level_index('biba', subject_level)
    oi = level_index('biba', object_level)
    if operation == 'write':
        if not rules.get('no_write_up', True):
            return {'allowed': True, 'reason': 'Simple integrity rule disabled.'}
        if si <= oi:
            return {'allowed': True,  'reason': f'Simple integrity: {subject_level} writes to {object_level}.'}
        else:
            return {'allowed': False, 'reason': f'No write-up violated: {subject_level} cannot corrupt {object_level}.'}
    elif operation == 'read':
        if not rules.get('no_read_down', True):
            return {'allowed': True, 'reason': 'Invocation rule disabled.'}
        if si >= oi:
            return {'allowed': True,  'reason': f'Invocation: {subject_level} reads trusted source {object_level}.'}
        else:
            return {'allowed': False, 'reason': f'No read-down violated: {subject_level} cannot read low-integrity {object_level}.'}
