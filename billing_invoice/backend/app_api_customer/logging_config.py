import logging
import os

def setup_logging(http_method,api_name ):
    log_directory = 'logs'
    if not os.path.exists(log_directory):
        os.makedirs(log_directory)
    
    log_file = os.path.join(log_directory, f'{http_method}_{api_name}.log')
    
    logging.basicConfig(
        filename=log_file,
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    logger = logging.getLogger(api_name)
    return logger