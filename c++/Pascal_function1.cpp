#include <iostream>
using namespace std;

// �p�ⶥ��
long long factorial(int n) {
    long long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// �p��զX�� C(n, k) = n! / (k! * (n-k)!)
long long combination(int n, int k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
}

// �L�X�����d�T����
void printPascal(int rows) {
    for (int i = 0; i < rows; i++) {
        // �L�X�e�m�Ů�
        for (int j = 0; j < rows - i; j++) {
            cout << "  ";
        }
        // �p��æL�X�զX��
        for (int j = 0; j <= i; j++) {
            cout << combination(i, j) << "   ";
        }
        cout << endl;
    }
}

int main() {
    int n;
    cout << "�п�J���: ";
    cin >> n;
    printPascal(n);
    return 0;
}