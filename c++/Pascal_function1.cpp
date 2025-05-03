#include <iostream>
using namespace std;

// 計算階乘
long long factorial(int n) {
    long long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// 計算組合數 C(n, k) = n! / (k! * (n-k)!)
long long combination(int n, int k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
}

// 印出帕斯卡三角形
void printPascal(int rows) {
    for (int i = 0; i < rows; i++) {
        // 印出前置空格
        for (int j = 0; j < rows - i; j++) {
            cout << "  ";
        }
        // 計算並印出組合數
        for (int j = 0; j <= i; j++) {
            cout << combination(i, j) << "   ";
        }
        cout << endl;
    }
}

int main() {
    int n;
    cout << "請輸入行數: ";
    cin >> n;
    printPascal(n);
    return 0;
}