def dominates(a, b, graph):
    if a == b:
        return True
    for child in graph.get(a, []):
        if dominates(child, b, graph):
            return True
    return False


def check_blp(subject_level, object_level, operation, rules, graph=None):
    graph = graph or {}
    if operation == "read" or operation == "execute":
        if not rules.get("no_read_up", True):
            return {"allowed": True, "reason": "Simple security rule disabled."}
        if dominates(subject_level, object_level, graph):
            return {"allowed": True, "reason": f"{subject_level} dominates {object_level}."}
        return {"allowed": False, "reason": f"No read-up: {subject_level} does not dominate {object_level}."}
    if operation == "write":
        if not rules.get("no_write_down", True):
            return {"allowed": True, "reason": "Star-property disabled."}
        if dominates(object_level, subject_level, graph):
            return {"allowed": True, "reason": f"{object_level} dominates {subject_level}."}
        return {"allowed": False, "reason": f"No write-down: {object_level} does not dominate {subject_level}."}
    return {"allowed": False, "reason": f"Unknown operation: {operation}"}


def check_biba(subject_level, object_level, operation, rules, graph=None):
    graph = graph or {}
    if operation == "write":
        if not rules.get("no_write_up", True):
            return {"allowed": True, "reason": "Simple integrity rule disabled."}
        if dominates(object_level, subject_level, graph):
            return {"allowed": True, "reason": f"{object_level} dominates {subject_level}."}
        return {"allowed": False, "reason": f"No write-up: {object_level} does not dominate {subject_level}."}
    if operation == "read" or operation == "execute":
        if not rules.get("no_read_down", True):
            return {"allowed": True, "reason": "Invocation rule disabled."}
        if dominates(subject_level, object_level, graph):
            return {"allowed": True, "reason": f"{subject_level} dominates {object_level}."}
        return {"allowed": False, "reason": f"No read-down: {subject_level} does not dominate {object_level}."}
    return {"allowed": False, "reason": f"Unknown operation: {operation}"}