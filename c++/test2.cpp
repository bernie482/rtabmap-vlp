#include <iostream>
using namespace std;

int main() {
    int n = 5; // ³]©w¼h¼Æ
    for (int i = 1; i <= n; i++) {
        for(int j = 0; j < n - i; j++){
            cout << " " ;
        }
        for (int j = 0; j < i; j++) {
            cout << "* ";
        }
        cout << endl;
    }
    return 0;
}