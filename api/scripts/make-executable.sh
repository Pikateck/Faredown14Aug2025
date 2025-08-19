#!/bin/bash

# Make all validation and monitoring scripts executable

echo "Making scripts executable..."

chmod +x api/scripts/master-validation.sh
chmod +x api/scripts/smoke-tests.sh  
chmod +x api/scripts/rollback-automation.sh
chmod +x api/scripts/cron-jobs.sh

# Install required dependencies
echo "Installing required dependencies..."

# Install prom-client for metrics
npm install prom-client --save

# Install k6 for load testing
if ! command -v k6 &> /dev/null; then
    echo "Installing k6..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install k6
    fi
fi

# Install bc for floating point calculations in shell scripts
if ! command -v bc &> /dev/null; then
    echo "Installing bc for calculations..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install bc
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install bc
    fi
fi

echo "✅ All scripts are now executable!"
echo ""
echo "Next steps:"
echo "1. Run: ./api/scripts/master-validation.sh"
echo "2. Check all validations pass"
echo "3. Deploy to production"
echo "4. Execute rollout phases"
