#include <iostream>
using namespace std;

#define ROWS 2
#define COLS 3
#define COLS_B 2

void matrixMultiply(int A[ROWS][COLS], int B[COLS][COLS_B], int C[ROWS][COLS_B]) {
    // ��l�Ƶ��G�x�} C
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS_B; j++) {
            C[i][j] = 0;  // ���M�s
            // ����x�}�ۭ�
            for (int k = 0; k < COLS; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
}

void printMatrix(int matrix[ROWS][COLS_B]) {
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS_B; j++) {
            cout << matrix[i][j] << " ";
        }
        cout << endl;
    }
}

int main() {
    // �w�q����R�A�x�}
    int A[ROWS][COLS] = {
        {1, 2, 3},
        {4, 5, 6}
    };

    int B[COLS][COLS_B] = {
        {7, 8},
        {9, 10},
        {11, 12}
    };

    int C[ROWS][COLS_B];  // �x�s���G���x�}

    // ����x�}�ۭ�
    matrixMultiply(A, B, C);

    // ��X���G
    cout << "���G�x�} C:" << endl;
    printMatrix(C);

    return 0;
}
